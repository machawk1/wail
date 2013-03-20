#!/usr/bin/env python
import gc
import os
import os.path
import cPickle
import json
import re
import pkg_resources #Added my MAT 20130213
from collections import OrderedDict
from contextlib import contextmanager
from threading import Thread

import tornado.httpserver
import tornado.ioloop
import tornado.template
import tornado.web

from hanzo.warctools import WarcRecord
from hanzo.httptools import RequestMessage, ResponseMessage


# warclinks.py
def parse_http_response(record):
  message = ResponseMessage(RequestMessage())
  remainder = message.feed(record.content[1])
  message.close()
  if remainder or not message.complete():
    if remainder:
      print 'trailing data in http response for %s'% record.url
    if not message.complete():
      print 'truncated http response for %s'%record.url

  header = message.header

  mime_type = [v for k,v in header.headers if k.lower() =='content-type']
  if mime_type:
    mime_type = mime_type[0].split(';')[0]
  else:
    mime_type = None

  return header.code, mime_type, message

def canonicalize_url(url):
  if re.match(r"^https?://[^/]+$", url):
    url += "/"
  return url

class IOWithProgress(object):
  def __init__(self, io, callback):
    self._io = io
    self.callback = callback

  def read(self, bs=None):
    self.callback()
    if bs:
      return self._io.read(bs)
    else:
      return self._io.read()

  def readline(self, bs=None):
    self.callback()
    if bs:
      return self._io.readline(bs)
    else:
      return self._io.readline()


class WarcIndexer(Thread):
  def __init__(self, path):
    super(WarcIndexer, self).__init__()
    idx_file = "%s.idx" % path
    if os.path.exists(idx_file) and os.path.getmtime(idx_file) >= os.path.getmtime(path):
      self.status = "loading-cache"
      self.bytes_total = os.path.getsize(idx_file)
    else:
      self.status = "indexing"
      self.bytes_total = os.path.getsize(path)
    self.path = path
    self.bytes_read = 0
    self.cancel = False

  def run(self):
    path = self.path
    idx_file = "%s.idx" % path

    records = None

    if os.path.exists(idx_file) and os.path.getmtime(idx_file) >= os.path.getmtime(path):
      print "Loading " + path + " from cache"
      self.status = "loading-cache"
      with open(idx_file, "rb") as f:
        def update_progress():
          self.bytes_read = f.tell()
        f_pr = IOWithProgress(f, update_progress)
        data = cPickle.load(f_pr)
      self.bytes_read = self.bytes_total

      if "version" in data and data["version"] == 1:
        records = data["records"]
    
    if not records:
      self.status = "indexing"
      self.bytes_total = os.path.getsize(self.path)

      print "Loading " + path
      records = OrderedDict()
      warc = WarcRecord.open_archive(path, gzip="auto")
      for (offset, record, errors) in warc.read_records(limit=None):
        if self.cancel:
          raise Exception("Loading " + path + " canceled")

        if record and re.sub(r"[^a-z;=/]+", "", record.type) == WarcRecord.RESPONSE and re.sub(r"[^a-z;=/]+", "", record.content[0]) == ResponseMessage.CONTENT_TYPE:
          http_response = parse_http_response(record)
          records[canonicalize_url(record.url)] = { "offset":offset, "code":http_response[0], "type":http_response[1] }

        self.bytes_read = offset

      warc.close()

      with open(idx_file, "wb") as f:
        cPickle.dump({ "version": 1, "records": records }, f)

    if self.cancel:
      raise Exception("Loading " + path + " canceled")

    print "Indexed "+path+". Found "+str(len(records))+" URLs"
    self.status = "indexed"
    self.records = records


class WarcProxy(object):
  def __init__(self):
    self.warc_files = set()
    self.indexers = {}
    self.indices = {}

  def load_warc_file(self, path):
    if path in self.indexers:
      indexer = self.indexers[path]
      if indexer.is_alive():
        return { "status": indexer.status, "bytes_total": indexer.bytes_total, "bytes_read": indexer.bytes_read }
      elif not indexer.cancel:
        self.indices[path] = indexer.records
        del self.indexers[path]

    if path in self.indices:
      return { "status": "indexed", "record_count": len(self.indices[path]) }
    else:
      self.warc_files.add(path)
      indexer = WarcIndexer(path)
      self.indexers[path] = indexer
      indexer.start()
      return { "status": indexer.status, "bytes_total": indexer.bytes_total, "bytes_read": indexer.bytes_read }

  def unload_warc_file(self, path):
    if path in self.indexers:
      print "Canceling " + path
      self.indexers[path].cancel = True
      self.warc_files.discard(path)
      if path in self.indices:
        del self.indices[path]

    elif path in self.indices:
      print "Unloading " + path
      self.warc_files.discard(path)
      del self.indices[path]

    gc.collect()

  def uri_count(self):
    n = 0
    for uris in self.indices.itervalues():
      n += len(uris)
    return n

  def iteruris(self):
    for uris in self.indices.itervalues():
      for uri in uris.iterkeys():
        yield uri

  def uri_tree(self, path, status_code=None, mime_type=None):
    if status_code:
      status_code = int(status_code)
    if mime_type:
      mime_type = re.compile(mime_type, re.I)

    HTTP_SUB = re.compile(r"^https?:\/\/|/$")
    PATH_PART = re.compile(r"[/?]*[^/?]+")

    tree = {}
    for (uri, data) in self.indices[path].iteritems():
      if status_code and status_code != data["code"]:
        continue
      if mime_type and (data["type"] is None or not mime_type.search(data["type"])):
        continue

      path_without_http = HTTP_SUB.sub("", uri)
      cur_tree = tree
      for part in PATH_PART.finditer(path_without_http):
        part = part.group(0)
        if "children" not in cur_tree:
          cur_tree["children"] = {}
        if part not in cur_tree["children"]:
          cur_tree["children"][part] = {}
        cur_tree = cur_tree["children"][part]
      cur_tree["uri"] = uri

    return tree

  @contextmanager
  def warc_record_for_uri(self, uri):
    found = False
    for (path, uris) in self.indices.iteritems():
      if uri in uris:
        warc = WarcRecord.open_archive(path, gzip="auto")
        warc.seek(uris[uri]["offset"])

        for record in warc.read_records(limit=1, offsets=uris[uri]["offset"]):
          found = True
          yield record

        warc.close()

    if not found:
      yield None


class WarcProxyWithWeb(object):
  WEB_RE = re.compile(r"^(?P<uri>/.*)$")
  WEB_VIA_PROXY_RE = re.compile(r"^http://(?P<host>warc)(?P<uri>/.*)$")

  def __init__(self, proxy_handler, web_handler):
    self.proxy_handler = proxy_handler
    self.web_handler = web_handler

  def __call__(self, request):
    """Called by HTTPServer to execute the request."""
    web_match = re.match(self.WEB_RE, request.uri)
    if not web_match:
      web_match = re.match(self.WEB_VIA_PROXY_RE, request.uri)

    if web_match:
      request.host = "warc"
      request.uri = web_match.group("uri")
      request.path, sep, query = request.uri.partition("?")
      self.web_handler.__call__(request)

    else:
      with self.proxy_handler.warc_record_for_uri(canonicalize_url(request.uri)) as record:
        if record:
          print "Serving %s from WARC" % request.uri

          # parse the response
          message = ResponseMessage(RequestMessage())
          message.feed(record[1].content[1])
          message.close()

          body = message.get_body()

          # construct new headers
          new_headers = []
          old_headers = []
          for k, v in message.header.headers:
            if not k.lower() in ("connection", "content-length", "cache-control", "accept-ranges", "etag", "last-modified", "transfer-encoding"):
              new_headers.append((k, v))
            old_headers.append(("X-Archive-Orig-%s" % k, v))

          new_headers.append(("Content-Length", "%d" % len(body)))
          new_headers.append(("Connection", "keep-alive"))

          # write the response
          request.write("%s %d %s\r\n" % (message.header.version, message.header.code, message.header.phrase))
          request.write("\r\n".join([ "%s: %s" % (k,v) for k,v in (new_headers + old_headers) ]))
          request.write("\r\n\r\n")
          request.write(body)

        else:
          print "Could not find %s in WARC" % request.uri
          request.write("HTTP/1.0 404 Not Found\r\nConnection: keep-alive\r\nContent-Type: text/plain\r\nContent-Length: 91\r\n\r\nThis URL is not in any of your archives. Close the WARC viewer to resume normal browsing.\r\n")
      request.finish()


class FileBrowserHandler(tornado.web.RequestHandler):
  def get(self):
    cur_dir = self.get_argument("path", None)

    if not cur_dir or not os.path.isdir(cur_dir):
      self.redirect("?path=%s" % os.getcwd())
      return

    try:
      files = os.listdir(cur_dir)
    except OSError:
      files = []

    files.sort(key=lambda f: f.lower())

    files = [{
      "title":    f,
      "path":     os.path.join(cur_dir, f),
      "isFolder": os.path.isdir(os.path.join(cur_dir, f)),
      "is_warc":  bool(re.match(r".+\.warc(\.gz)?$", f)),
      "isLazy":   os.path.isdir(os.path.join(cur_dir, f))
    } for f in files if (os.path.isdir(os.path.join(cur_dir, f)) or re.match(r".+\.warc(\.gz)?$", f)) ]
    
    self.set_header("Content-Type", "application/json")
    self.set_header("Access-Control-Allow-Origin", "*")
    self.write(json.dumps(files))


class MainHandler(tornado.web.RequestHandler):
  def get(self):
    self.render("html/frames.html")


class WarcIndexHandler(tornado.web.RequestHandler):
  def initialize(self, warc_proxy):
    self.warc_proxy = warc_proxy

  def get(self):
    self.set_header("Content-Type", "application/json")
    self.set_header("Access-Control-Allow-Origin", "*")
    self.write(json.dumps(self.warc_proxy.uri_tree(
                 path=self.get_argument("path"),
                 status_code=self.get_argument("status_code", None),
                 mime_type=self.get_argument("mime_type", None))))


class WarcHandler(tornado.web.RequestHandler):
  def initialize(self, warc_proxy):
    self.warc_proxy = warc_proxy

  def get(self, action):
    if action == "list":
      self.set_header("Content-Type", "application/json")
      self.set_header("Access-Control-Allow-Origin", "*")
      self.write(json.dumps({
        "paths": [ f for f in self.warc_proxy.warc_files ],
        "uri_count": self.warc_proxy.uri_count()
      }))

  def post(self, action):
    if action == "load":
      path = self.get_argument("path")
      index_status = self.warc_proxy.load_warc_file(path)
      self.set_header("Content-Type", "application/json")
      self.set_header("Access-Control-Allow-Origin", "*")
      self.write(json.dumps(index_status))
    elif action == "unload":
      self.set_header("Access-Control-Allow-Origin", "*")
      self.warc_proxy.unload_warc_file(self.get_argument("path"))


warc_proxy = WarcProxy()
web_application = tornado.web.Application([
  (r"/", MainHandler),
  (r"/browse\.json", FileBrowserHandler),
  (r"/(list|load|unload)-warcs?", WarcHandler, { "warc_proxy":warc_proxy }),
  (r"/index\.json", WarcIndexHandler, { "warc_proxy":warc_proxy }),
  (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": "html"})
], debug=True)

my_application = WarcProxyWithWeb(warc_proxy, web_application)

if __name__ == "__main__":
  http_server = tornado.httpserver.HTTPServer(my_application)
  http_server.listen(8000)

  print "WARC viewer"
  print
  print "Firefox:"
  print "  Use the add-on."
  print
  print "Other browsers:"
  print "  Configure your browser to use this proxy:"
  print "    http://127.0.0.1:8000/"
  print "  and then go to http://warc/"
  print

  tornado.ioloop.IOLoop.instance().start()


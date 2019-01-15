import tornado.ioloop
import tornado.web
import requests

host = 'localhost'
waybackPort = '8080'
# Use a separate JSON file that only queries the local WAIL instance for MemGator
archiveConfigFile = '/Applications/WAIL.app/config/archive.json'

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        iwa = isWaybackAccessible()
        print iwa
        self.write(iwa)

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
    ])

def isWaybackAccessible():
    try:
      r = requests.get('http://' + host + ':' + waybackPort)
      with open(archiveConfigFile, 'r') as myfile:
        data=myfile.read()
      return data
    except requests.exceptions.ConnectionError as e:
      return ''



if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    tornado.ioloop.IOLoop.current().start()
"""a skeleton class for archive records"""

from gzip import GzipFile
import re

from hanzo.warctools.stream import open_record_stream

strip = re.compile(r'[^\w\t \|\\\/]')


def add_headers(**kwargs):
    """a useful helper for defining header names in record formats"""

    def _add_headers(cls):
        for k, v in kwargs.iteritems():
            setattr(cls, k, v)
        cls._HEADERS = kwargs.keys()
        return cls
    return _add_headers


class ArchiveParser(object):
    """ methods parse, and trim """
    pass


@add_headers(DATE='Date',
             CONTENT_TYPE='Type',
             CONTENT_LENGTH='Length',
             TYPE='Type',
             URL='Url')
class ArchiveRecord(object):
    """An archive record has some headers, maybe some content and
    a list of errors encountered. record.headers is a list of tuples (name,
    value). errors is a list, and content is a tuple of (type, data)"""

    #pylint: disable-msg=e1101

    def __init__(self, headers=None, content=None, errors=None):
        self.headers = headers if headers else []
        self.content = content if content else (None, "")
        self.errors = errors if errors else []

    HEADERS = staticmethod(add_headers)

    @property
    def date(self):
        return self.get_header(self.DATE)

    def error(self, *args):
        self.errors.append(args)

    @property
    def type(self):
        return self.get_header(self.TYPE)

    @property
    def content_type(self):
        return self.content[0]

    @property
    def content_length(self):
        return len(self.content[1])

    @property
    def url(self):
        return self.get_header(self.URL)

    def get_header(self, name):
        for k, v in self.headers:
            if name == k:
                return v

    def set_header(self, name, value):
        self.headers = [(k, v) for (k, v) in self.headers if k != name]
        self.headers.append((name, value))

    def dump(self, content=True):
        print 'Headers:'
        for (h, v) in self.headers:
            print '\t%s:%s' % (h, v)
        if content and self.content:
            print 'Content Headers:'
            content_type, content_body = self.content
            print '\t', self.CONTENT_TYPE, ':', content_type
            print '\t', self.CONTENT_LENGTH, ':', len(content_body)
            print 'Content:'
            ln = min(1024, len(content_body))
            print '\t', strip.sub(lambda x: '\\x%00X' % ord(x.group()),
                                  content_body[:ln])
            print '\t...'
            print
        else:
            print 'Content: none'
            print
            print
        if self.errors:
            print 'Errors:'
            for e in self.errors:
                print '\t', e

    def write_to(self, out, newline='\x0D\x0A', gzip=False):
        if gzip:
            out = GzipFile(fileobj=out)
        self._write_to(out, newline)
        if gzip:
            out.flush()
            out.close()

    def _write_to(self, out, newline):
        raise AssertionError('this is bad')

    ### class methods for parsing
    @classmethod
    def open_archive(cls, filename=None, file_handle=None,
                     mode="rb+", gzip="auto"):
        """Generically open an archive - magic autodetect"""
        if cls is ArchiveRecord:
            cls = None # means guess
        return open_record_stream(cls, filename, file_handle, mode, gzip)

    @classmethod
    def make_parser(self):
        """Reads a (w)arc record from the stream, returns a tuple (record,
        errors).  Either records is null or errors is null. Any
        record-specific errors are contained in the record - errors is only
        used when *nothing* could be parsed"""
        raise StandardError()

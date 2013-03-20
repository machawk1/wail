"""Tests for http parsing."""
import unittest2

from hanzo.httptools.messaging import \
    RequestMessage, \
    ResponseMessage

get_request_lines = [
        "GET / HTTP/1.1",
        "Host: example.org",
        "",
        "",
        ]
get_request = "\r\n".join(get_request_lines)
get_response_lines = [
        "HTTP/1.1 200 OK",
        "Host: example.org",
        "Content-Length: 5",
        "",
        "tests",
        ]
get_response = "\r\n".join(get_response_lines)


class GetChar(unittest2.TestCase):
    """Test basic GET request parsing. Single character at a time."""

    def runTest(self):
        """Attempts to parse the contents of get_request and
        get_response."""
        p = RequestMessage()
        for t in get_request:
            text = p.feed(t)
            self.assertEqual(text, '')

        self.assertTrue(p.headers_complete())
        self.assertTrue(p.complete())

        self.assertEqual(get_request, p.get_decoded_message())

        p = ResponseMessage(p)
        for char in get_response:
            text = p.feed(char)
            self.assertEqual(text, '')

        self.assertTrue(p.headers_complete())
        self.assertTrue(p.complete())
        self.assertEqual(get_response, p.get_decoded_message())
        self.assertEqual("tests", p.get_body())


class GetLines(unittest2.TestCase):
    """Test basic GET request parsing. Single line at a time."""

    def runTest(self):
        """Attempts to parse get_request_lines, i.e. get_request line
        at a time."""

        p = RequestMessage()
        for line in get_request_lines[:-1]:
            text = p.feed(line)
            self.assertEqual(text, "")
            text = p.feed("\r\n")
            self.assertEqual(text, "")
        text = p.feed(get_request_lines[-1])
        self.assertEqual(text, "")

        self.assertTrue(p.headers_complete())
        self.assertTrue(p.complete())

        self.assertEqual(get_request, p.get_decoded_message())

        p = ResponseMessage(p)
        for line in get_response_lines[:-1]:
            text = p.feed(line)
            self.assertEqual(text, "")
            text = p.feed("\r\n")
            self.assertEqual(text, "")
        text = p.feed(get_response_lines[-1])

        self.assertEqual(text, "")

        self.assertTrue(p.headers_complete())
        self.assertTrue(p.complete())

        self.assertEqual(get_response, p.get_decoded_message())

        self.assertEqual(p.code, 200)
        self.assertEqual(p.header.version, "HTTP/1.1")
        self.assertEqual(p.header.phrase, "OK")


head_request = "\r\n".join([
    "HEAD / HTTP/1.1",
    "Host: example.org",
    "",
    "",
])
head_response = "\r\n".join([
    "HTTP/1.1 200 OK",
    "Host: example.org",
    "Content-Length: 5",
    "",
    "",
])


class HeadTest(unittest2.TestCase):
    """Tests parsing of HEAD requests and responses."""

    def runTest(self):
        """Constructs a RequestMessage and ResponseMessage and uses them to
        parse HEAD messages."""
        p = RequestMessage()
        text = p.feed(head_request)

        self.assertEqual(text, '')
        self.assertTrue(p.complete())
        self.assertEqual(head_request, p.get_decoded_message())

        p = ResponseMessage(p)
        text = p.feed(head_response)

        self.assertEqual(text, '')
        self.assertTrue(p.complete())
        self.assertEqual(head_response, p.get_decoded_message())
        self.assertEqual(p.code, 200)
        self.assertEqual(p.header.version, "HTTP/1.1")
        self.assertEqual(p.header.phrase, "OK")


class PostTestChunked(unittest2.TestCase):
    """Tests the parser with a POST request with chunked encoding."""
    post_request = "\r\n".join([
            "POST / HTTP/1.1",
            "Host: example.org",
            "Transfer-Encoding: chunked",
            "",
            "8",
            "abcdefgh",
            "0",
            "",
            "",
            ])
    post_response = "\r\n".join([
            "HTTP/1.1 100 Continue",
            "Host: example.org",
            "",
            "HTTP/1.0 204 No Content",
            "Date: now!",
            "",
            "",
            ])

    def runTest(self):
        """Tests parsing of POST requests and responses."""
        p = RequestMessage()
        text = p.feed(self.post_request)

        self.assertEqual(text, '')
        self.assertTrue(p.complete())

        p = ResponseMessage(p)
        text = p.feed(self.post_response)

        self.assertEqual(text, '')
        self.assertTrue(p.complete())
        self.assertEqual(p.code, 204)
        self.assertEqual(p.header.version, "HTTP/1.0")
        self.assertEqual(p.header.phrase, "No Content")


class PostTestChunkedEmpty(unittest2.TestCase):
    """Tests the parser with a POST request with chunked encoding and
    an empty body."""
    post_request = "\r\n".join([
            "POST / HTTP/1.1",
            "Host: example.org",
            "Transfer-Encoding: chunked",
            "",
            "0",
            "",
            "",
            ])
    post_response = "\r\n".join([
            "HTTP/1.1 100 Continue",
            "Host: example.org",
            "",
            "HTTP/1.0 204 No Content",
            "Date: now!",
            "",
            "",
            ])

    def runTest(self):
        """Tests parsing of POST requests and responses."""
        p = RequestMessage()
        text = p.feed(self.post_request)

        self.assertEqual(text, '')
        self.assertTrue(p.complete())

        p = ResponseMessage(p)
        text = p.feed(self.post_response)

        self.assertEqual(text, '')
        self.assertTrue(p.complete())
        self.assertEqual(p.code, 204)
        self.assertEqual(p.header.version, "HTTP/1.0")
        self.assertEqual(p.header.phrase, "No Content")


class TestTwoPartStatus(unittest2.TestCase):
    """This is a request taken from the wild that broke the crawler. The main
    part being tested is the status line without a message."""

    request = "\r\n".join([
            "GET / HTTP/1.1",
            "Host: example.org", # Name changed to protect the guilty
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3",
            "Accept-Encoding: gzip,deflate,sdch",
            "Accept-Language: en-US,en;q=0.8",
            "Connection: keep-alive",
            "Host: example.org",
            "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.77 Safari/535.7",
            "",
            "",
            ])
    response = "\r\n".join([
            "HTTP/1.1 404",
            "Cache-Control: no-cache",
            "Content-Length: 0",
            "Content-Type:image/gif",
            "Pragma:no-cache",
            "nnCoection: close",
            "",
            "",
            ])

    def runTest(self):
        """Tests parsing of a broken response."""
        p = RequestMessage()
        text = p.feed(self.request)

        self.assertEqual(text, '')
        self.assertTrue(p.complete())

        p = ResponseMessage(p)
        text = p.feed(self.response)

        self.assertEqual(text, '')
        self.assertTrue(p.complete())
        self.assertEqual(p.code, 404)
        self.assertEqual(p.header.version, "HTTP/1.1")

if __name__ == '__main__':
    unittest2.main()

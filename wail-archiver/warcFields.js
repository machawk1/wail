const warcHeader =
  'WARC/1.0\r\n' +
  'WARC-Type: warcinfo\r\n' +
  'WARC-Date: {{now}}\r\n' +
  'WARC-Filename: {{fileName}}\r\n' +
  'WARC-Record-ID: <urn:uuid:{{rid}}>\r\n' +
  'Content-Type: application/warc-fields\r\n' +
  'Content-Length: {{len}}\r\n'

const warcHeaderContent =
  'software: WAIL/{{version}}\r\n' +
  'format: WARC File Format 1.0\r\n' +
  'conformsTo: http://bibnum.bnf.fr/WARC/WARC_ISO_28500_version1_latestdraft.pdf\r\n' +
  'isPartOf: {{isPartOfV}}\r\n' +
  'description: {{warcInfoDescription}}\r\n' +
  'robots: ignore\r\n' +
  'http-header-user-agent: {{ua}}\r\n'

const warcMetadataHeader =
  'WARC/1.0\r\n' +
  'WARC-Type: metadata\r\n' +
  'WARC-Target-URI: {{targetURI}}\r\n' +
  'WARC-Date: {{now}}\r\n' +
  'WARC-Concurrent-To: <urn:uuid:{{concurrentTo}}>\r\n' +
  'WARC-Record-ID: <urn:uuid:{{rid}}>\r\n' +
  'Content-Type: application/warc-fields\r\n' +
  'Content-Length: {{len}}\r\n'

const warcRequestHeader =
  'WARC/1.0\r\n' +
  'WARC-Type: request\r\n' +
  'WARC-Target-URI: {{targetURI}}\r\n' +
  'WARC-Date: {{now}}\r\n' +
  'WARC-Concurrent-To: <urn:uuid:{{concurrentTo}}>\r\n' +
  'WARC-Record-ID: <urn:uuid:{{rid}}>\r\n' +
  'Content-Type: application/http; msgtype=request\r\n' +
  'Content-Length: {{len}}\r\n'

const warcResponseHeader =
  'WARC/1.0\r\n' +
  'WARC-Type: response\r\n' +
  'WARC-Target-URI: {{targetURI}}\r\n' +
  'WARC-Date: {{now}}\r\n' +
  'WARC-Record-ID: <urn:uuid:{{rid}}>\r\n' +
  'Content-Type: application/http; msgtype=response\r\n' +
  'Content-Length: {{len}}\r\n'

const CRLF = '\r\n'
const recordSeparator = `${CRLF}${CRLF}`

const warcFields = {
  warcHeader,
  warcHeaderContent,
  warcRequestHeader,
  warcResponseHeader,
  warcMetadataHeader,
  recordSeparator,
  CRLF
}

export default warcFields

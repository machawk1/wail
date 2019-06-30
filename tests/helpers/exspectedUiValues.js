const startedCrawlNotifsExpected = [{
  level: 'info',
  message: 'Archiving http://example.com for default Now!',
  title: 'Info',
  uid: 'Archiving http://example.com for default Now!'
},
{
  level: 'info',
  message: 'Starting Heritrix Crawl for http://example.com',
  title: 'Info',
  uid: 'Starting Heritrix Crawl for http://example.com'
},
{
  level: 'success',
  message: 'Heritrix Crawl for http://example.com was built',
  title: 'Success',
  uid: 'Heritrix Crawl for http://example.com was built'
},
{
  level: 'success',
  message: 'Heritrix Crawl for http://example.com has started',
  title: 'Success',
  uid: 'Heritrix Crawl for http://example.com has started'
},
{
  level: 'info',
  message: 'Terminating Heritrix Crawl for http://example.com',
  title: 'Info',
  uid: 'Terminating Heritrix Crawl for http://example.com'
},
{
  level: 'success',
  message: 'Heritrix Crawl for http://example.com has ended',
  title: 'Success',
  uid: 'Heritrix Crawl for http://example.com has ended'
}
]

const startStopServicesExpected = [
  {
    level: 'info',
    message: 'Stopping Heritrix',
    title: 'Info',
    uid: 'Stopping Heritrix'
  },
  {
    level: 'info',
    message: 'Starting Heritrix',
    title: 'Info',
    uid: 'Starting Heritrix'
  },
  {
    level: 'success',
    message: 'Started Service Heritrix',
    title: 'Success',
    uid: 'Started Service Heritrix'
  },
  {
    level: 'info',
    message: 'Stopping Wayback',
    title: 'Info',
    uid: 'Stopping Wayback'
  },
  {
    level: 'info',
    message: 'Starting Wayback',
    title: 'Info',
    uid: 'Starting Wayback'
  },
  {
    level: 'success',
    message: 'Started Service Wayback',
    title: 'Success',
    uid: 'Started Service Wayback'
  }
]

export {
  startedCrawlNotifsExpected,
  startStopServicesExpected
}

const DB = require('nedb')
const _ = require('lodash')
const util = require('util')
const Immutable = require('immutable')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fs = require('fs-extra')
const through2 = require('through2')
const prettyBytes = require('pretty-bytes')
const moment = require('moment')
const path = require('path')

const zlib = require('zlib')
const rp = require('request-promise')
const cheerio = require('cheerio')
const urlType = require('url-type')
const url = require('url')
const { STATUS_CODES } = require('http')
const { StatusCodeError, RequestError, TransformError } = require('request-promise/errors')
const normalizeUrl = require('normalize-url')

const inpect = _.partialRight(util.inspect, { depth: 2, colors: true })

const linkStat = (outlink, stats, seedHost) => {
  if (outlink && outlink.indexOf('mailto:') < 0) {
    let relTo = urlType.relativeTo(outlink)
    if (relTo) {
      if (relTo === 'directory') {
        stats.iLinks++
      } else if (relTo === 'origin') {
        stats.sDomain++
      } else {
        if (url.parse(outlink).hostname === seedHost) {
          stats.sDomain++
        } else {
          stats.eLinks++
        }
      }
    } else {
      if (url.parse(outlink).hostname === seedHost) {
        stats.sDomain++
      } else {
        stats.eLinks++
      }
    }
  }
}

const determinLinkType = (link, stats, seedHost) => {
  if (link && link.rel) {
    let rel = link.rel.toLowerCase()
    if (rel.indexOf('stylesheet') >= 0) {
      stats.style++
      linkStat(link.href, stats, seedHost)
    } else if (rel.indexOf('icon') >= 0) {
      stats.Images++
      linkStat(link.href, stats, seedHost)
    }
  }
}

const statBody = (seedUrl, theDom) => {
  let stats = {
    Images: 0, style: 0, iframes: 0,
    embed: 0, scripts: 0, object: 0,
    applet: 0, audio: 0, video: 0,
    iLinks: 0, sDomain: 0, eLinks: 0
  }
  let seedHost = url.parse(seedUrl).hostname
  let $ = cheerio.load(theDom)

  $('a').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.href, stats, seedHost)
    }
  })

  $('link').each(function (i, elem) {
    determinLinkType(elem.attribs, stats, seedHost)
  })

  $('script[src]').each(function (i, elem) {
    linkStat(elem.attribs.src, stats, seedHost)
    stats.scripts++
  })

  $('img').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.Images++
  })

  $('embed').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.embed++
  })

  $('object').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.data, stats, seedHost)
    }
    stats.object++
  })

  $('applet').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.applet++
  })

  $('video').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.video++
  })

  $('audio').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.audio++
  })

  $('bgsound').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.audio++
  })

  $('iframe').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.iframes++
  })
  return stats
}

const uriSanity = _.partialRight(normalizeUrl, { stripWWW: false, removeTrailingSlash: false })

const unGZ = gzipped => new Promise((resolve, reject) => {
  zlib.gunzip(gzipped, (err, dezipped) => {
    if (err) {
      reject(err)
    } else {
      resolve(dezipped.toString('utf-8'))
    }
  })
})

function makeRequest (config) {
  return new Promise((resolve, reject) =>
    rp(config)
      .then(res => {
        let cType = res.headers[ 'content-type' ]
        if (cType) {
          if (cType.toLowerCase().indexOf('html') > 0) {
            let encoding = res.headers[ 'content-encoding' ]
            if (encoding && encoding.indexOf('gzip') >= 0) {
              return unGZ(res.body)
                .then(body => {
                  resolve(body)
                })
                .catch(error => {
                  reject({
                    wasError: true,
                    m: 'HTTP 200 ok. The html page was gziped and and error happened while un-gzipping it.'
                  })
                })
            } else {
              resolve(res.body)
            }
          } else {
            reject({ wasError: true, m: `HTTP 200 ok. The URI did not have content type html. It was ${cType}` })
          }
        } else {
          reject({ wasError: true, m: 'HTTP 200 ok. No content type was specified in the response.' })
        }
      })
      .catch(StatusCodeError, (reason) => {
        // not 2xx
        let humanized = STATUS_CODES[ reason.statusCode ]
        let c = `${reason.statusCode}`[ 0 ]
        let { headers } = reason.response
        if (c === '3') {
          let toWhere
          if (headers[ 'location' ]) {
            toWhere = `The location pointed to is ${headers[ 'location' ]}`
          } else {
            toWhere = 'No location was given in the response headers'
          }
          reject({
            wasError: true,
            m: `HTTP ${reason.statusCode} ${humanized}. ${toWhere}`
          })
        } else {
          // just report
          reject({
            wasError: true,
            m: `HTTP ${reason.statusCode} ${humanized}`
          })
        }
      })
      .catch(RequestError, (reason) => {
        console.log(reason.error)
        if (reason.error.code === 'ENOTFOUND') {
          reject({ wasError: true, m: 'The URI was not found on DNS lookup' })
        } else {
          reject({ wasError: true, m: 'Severe error happened. Are you connected to the internet?' })
        }
      }))
}

function checkSeed (seed) {
  let uri = uriSanity(seed)
  let config = {
    method: 'GET', followRedirect: false, uri,
    resolveWithFullResponse: true
  }
  return new Promise((resolve, reject) =>
    makeRequest(config)
      .then(body => {
        let stats = statBody(seed, body)
        resolve({
          wasError: false,
          stats
        })
      })
      .catch(error => {
        reject(error)
      })
  )
}

// ///csoduedu
console.log(_.omitBy({
    Images: 163,
    style: 9,
    iframes: 5,
    embed: 0,
    scripts: 8,
    object: 0,
    applet: 0,
    audio: 0,
    video: 1,
    iLinks: 2,
    sDomain: 254,
    eLinks: 201
  }
  , v => v === 0))

// fs.readFile('cshtml.html', 'utf8', (err, data) => {
//   console.log()
//   statBody('http://odu.edu/compsci', data)
//
// })

// fs.readFile('yt.html', 'utf8', (err, data) => {
//   console.log()
//   statBody('https://www.youtube.com/watch?v=lEVY8ZRsxvI', data)
// })
// const inpect = _.partialRight(util.inspect, { depth: null, colors: true })
// const tp = path.resolve('.', 'tweets.json')
// console.log(tp)
//
// Promise.promisifyAll(fs)
// fs.readJSONAsync(tp)
//   .then(tweets => {
//     // 'https://twitter.com/Galsondor/status/800512053156974596'
//     _.take(tweets,100).forEach(tweet => {
//       // console.log(inpect(tweet))
//       console.log(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
//       console.log('------------------------------------------')
//     })
//
//   })
//   .catch(error => {
//     console.error(error)
//   })

// const { CollectionEvents } = {
//   CollectionEvents: keyMirror({
//     GOT_ALL_COLLECTIONS: null,
//     CREATED_COLLECTION: null,
//     ADD_METADATA_TO_COLLECTION: null,
//     ADDED_WARCS_TO_COLL: null,
//   })
// }
//
// const vals = Object.values(CollectionEvents)
// const colActions = new Set(vals)
// var suite = new Benchmark.Suite()
//
// // add tests
// suite.add('Array#indexOf#found', function () {
//   vals.indexOf('ADDED_WARCS_TO_COLL')
// }).add('Array#indexOf#notfound', function () {
//   vals.indexOf('xyz')
// }).add('Array#includes#found', function () {
//   vals.includes('ADDED_WARCS_TO_COLL')
// }).add('Array#includes#notfound', function () {
//   vals.includes('xyz')
// })
//   .add('Set#has#found', function () {
//     colActions.has('ADDED_WARCS_TO_COLL')
//   }).add('Set#has#notFound', function () {
//   colActions.has('xyz')
// })
// // add listeners
//   .on('cycle', function (event) {
//     console.log(String(event.target));
//   })
//   .on('complete', function () {
//     console.log('Fastest is ' + this.filter('fastest').map('name'));
//   })
//   // run async
//   .run({ 'async': true })
// console.log(...colActions)

// let sss = [ { url: 'http://cs.odu.edu', jobId: 1473098189935 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'cs.odu.edu/~jberlin', jobId: 1475010467129 },
//   { url: 'cs.odu.edu/~jberlin', jobId: 1475012345753 },
//   { url: 'cs.odu.edu/~jberlin', jobId: 1475014488646 },
//   { url: 'cs.odu.edu/~jberlin', jobId: 1475014754339 },
//   { url: 'cs.odu.edu', jobId: 1475473536070 } ]
//
// let trans = _.chain(sss)
//   .groupBy(it => it.url)
//   .mapValues(ar => {
//     let it = ar.map(it => it.jobId)
//     let jobIds = _.uniq(it)
//     return {
//       mementos: it.length,
//       jobIds
//     }
//   })
//   .toPairs()
//   .flatMap(it => {
//     return {
//       url: it[ 0 ],
//       jobIds: it[ 1 ].jobIds,
//       mementos: it[ 1 ].mementos
//     }
//   }).value()
// console.log(util.inspect(trans, { colors: true, depth: null }))

// console.log('hi')

//
// const a = new DB({
//   filename: '/home/john/my-fork-wail/dev_coreData/database/archives.db',
//   autoload: true
// })
//
// const c = new DB({
//   filename: '/home/john/my-fork-wail/dev_coreData/database/crawls.db',
//   autoload: true
// })
//
// function *updateGen (iterate) {
//   for (let it of iterate)
//     yield it
// }
//
// function update (iter, updateFun) {
//   let { done, value } = iter.next()
//   if (!done) {
//     updateFun(value)
//       .then(() => {
//         update(iter, updateFun)
//       })
//       .catch(error => {
//         console.error(error)
//       })
//   }
// }
//
// const runsToLatest = (db, run) => new Promise((resolve, reject) => {
//   run.hasRuns = true
//   db.insert(run, (err) => {
//     if (err) {
//       reject(err)
//     } else {
//       resolve()
//     }
//   })
// })
//
// // const updater = _.partial(runsToLatest, c)
// c.find({}, (err, crawls) => {
//   // c.remove({}, { multi: true }, function (err, numRemoved) {
//   //   update(updateGen(crawls), updater)
//   // })
//   let cs = _.keyBy(crawls, crawl => crawl.jobId)
//   let newA = []
//   a.find({}, (erra, archives) => {
//     console.log(inpect(archives))
//     // archives.forEach(ar => {
//     //   // console.log(inpect(ar))
//     //   if (ar.seeds.length > 0) {
//     //     ar.seeds = ar.seeds.map(s => {
//     //       s.added = moment(cs[ Math.min(...s.jobIds) ].jobId).format()
//     //       s.lastUpdated = moment(cs[ Math.max(...s.jobIds) ].latestRun.timestamp).format()
//     //       return s
//     //     })
//     //   }
//     //   newA.push(ar)
//     // })
//     // console.log(inpect(newA))
//     // a.remove({}, { multi: true }, function (err, numRemoved) {
//     //   a.insert(newA, (err) => {
//     //     console.log(err)
//     //   })
//     // })
//   })
//
// })

//

// {"_id":"sdas2","name":"sdas2","colpath":"/home/john/my-fork-wail/archives2/collections/sdas","archive":"/home/john/my-fork-wail/archives2/collections/sdas/archive","indexes":"/home/john/my-fork-wail/archives2/collections/sdas/indexes","colName":"sdas2","numArchives":0,"metadata":{"title":"klajsdlk;asjdk","description":"jkhdsakjlh"},"hasRunningCrawl":false,"lastUpdated":"2016-11-13T18:52:11-05:00","seeds":[{"booo":{"url":"cs.odu.edu","jobIds":[1475473841435],"mementos":1}}],"created":"2016-11-13T18:52:11-05:00","size":"0 B"}

// let booo = { "url": "cs.odu.edu", "jobIds": [ 1475473841435 ], "mementos": 1 }
//
// a.findOne({ colName: 'sdas2' }, (err, doc) => {
//   if (!_.find(doc.seeds, { url: booo.url })) {
//     console.log('its not in')
//     a.update({ colName: 'sdas2' }, { $push: { seeds: booo } }, { returnUpdatedDocs: true }, (err, numUpdated, updated) => {
//       console.log(err, numUpdated, updated)
//     })
//   } else {
//     console.log('its in')
//     console.log(doc.seeds)
//     let updatedSeeds = doc.seeds.map(seed => {
//       if (seed.url === booo.url) {
//         seed.jobIds.push(booo.jobIds[ 0 ])
//         seed.mementos += 1
//       }
//       return seed
//     })
//     console.log(updatedSeeds)
//     a.update({ colName: 'sdas2' }, { $set: { seeds: updatedSeeds } }, { returnUpdatedDocs: true }, (err, ...rest) => {
//       console.log(err, ...rest)
//     })
//   }
// })
// const transformSeeds = seeds => _.chain(seeds)
//   .groupBy(it => it.url)
//   .mapValues(ar => {
//     let it = ar.map(it => it.jobId)
//     let jobIds = _.uniq(it)
//     return {
//       mementos: it.length,
//       jobIds
//     }
//   })
//   .toPairs()
//   .flatMap(it => {
//     return {
//       url: it[ 0 ],
//       jobIds: it[ 1 ].jobIds,
//       mementos: it[ 1 ].mementos
//     }
//   }).value()
//
// let newCols = []
// const update = (iter, collections, runs) => {
//   let { done, value: col } = iter.next()
//   if (!done) {
//     runs.find({ forCol: col.colName }, (err, colRuns) => {
//       if (colRuns.length > 0) {
//         let seeds = []
//         let rms = []
//         colRuns.forEach(cur => {
//           if (Array.isArray(cur.urls)) {
//             cur.urls.forEach(it => {
//               seeds.push({
//                 url: it,
//                 jobId: cur.jobId
//               })
//             })
//           } else {
//             seeds.push({
//               url: cur.urls,
//               jobId: cur.jobId
//             })
//           }
//           if (cur.runs.length > 0) {
//             rms = rms.concat(cur.runs.map(r => moment(r.timestamp)))
//           }
//         })
//         col.lastUpdated = rms.length > 0 ? moment.max(rms).format() : moment().format()
//         col.seeds = transformSeeds(seeds)
//       } else {
//         col.lastUpdated = moment().format()
//         col.seeds = []
//       }
//       col.created = moment().format()
//       let size = 0
//       fs.walk(col.archive)
//         .pipe(through2.obj(function (item, enc, next) {
//           if (!item.stats.isDirectory()) this.push(item)
//           next()
//         }))
//         .on('data', item => {
//           size += item.stats.size
//         })
//         .on('end', () => {
//           col.size = prettyBytes(size)
//           delete col.crawls
//           newCols.push(col)
//           update(iter, collections, runs)
//         })
//     })
//   } else {
//     console.log(util.inspect(newCols, { depth: null, colors: true }))
//     a.remove({}, { multi: true }, (x, y) => {
//       a.insert(newCols, (erri, newDocs) => {
//         console.log(newDocs)
//       })
//     })
//   }
// }
//
// a.find({}, (err, collections) => {
//   console.log(util.inspect(collections, { depth: null, colors: true }))
//   // update(updateGen(collections), a, c)
//   // collections.forEach(col => {
//   //   c.find({ forCol: col.colName }, (err, colRuns) => {
//   //     console.log(util.inspect(col, { depth: null, colors: true }))
//   //     console.log(util.inspect(colRuns, { depth: null, colors: true }))
//   //     if (colRuns.length > 0) {
//   //       let seeds = colRuns.map(r => r.urls)
//   //       console.log(seeds)
//   //     } else {
//   //       console.log('no seeds')
//   //       a.update({ _id: col._id },)
//   //     }
//   //     console.log('------------------------------')
//   //   })
//   // })
// })



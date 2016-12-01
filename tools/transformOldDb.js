const moment = require('../wail-core/util/momentWplugins')
// require('moment-precise-range-plugin')
const DB = require('nedb')
const _ = require('lodash')
const util = require('util')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fs = require('fs-extra')
const through2 = require('through2')
const prettyBytes = require('pretty-bytes')
const path = require('path')
const schedule = require('node-schedule')

Promise.promisifyAll(DB.prototype)

function *updateGen (iterate) {
  for (let it of iterate)
    yield it
}

// const update = (iter, updateFun) => {
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

const transformSeeds = seeds =>
  _.chain(seeds)
    .groupBy(it => it.url)
    .mapValues(ar => {
      let it = ar.map(it => it.jobId)
      let jobIds = _.uniq(it)
      return {
        mementos: it.length,
        jobIds
      }
    })
    .toPairs()
    .flatMap(it => {
      return {
        url: it[ 0 ],
        jobIds: it[ 1 ].jobIds,
        mementos: it[ 1 ].mementos
      }
    }).value()

const transformRuns = runs =>
  _.chain(runs)
    .groupBy(it => it.url)
    .mapValues(ar => {
      let it = ar.map(it => it.jobId)
      let jobIds = _.uniq(it)
      return {
        mementos: it.length,
        jobIds
      }
    })
    .toPairs()
    .flatMap(it => {
      return {
        url: it[ 0 ],
        jobIds: it[ 1 ].jobIds,
        mementos: it[ 1 ].mementos
      }
    }).value()

const changeColLocs = (adb, from) => {

  let changeKeys = [
    'colpath',
    'archive',
    'indexes',
  ]

  adb.findAsync({})
    .then(docs => {
      let nDocs = docs.map(doc =>
        _.mapValues(doc, (v, k) => {
          if (changeKeys.includes(k)) {
            return S(v).replaceAll(from, moveWhere).s
          } else {
            return v
          }
        })
      )
      console.log(inspect(nDocs))
      return adb.removeAsync({}, { multi: true })
        .then(() => adb.insertAsync(nDocs)
          .then(() => {
            console.log('done')
          })
          .catch(error => {
            console.error('inserting failed', error)
          })
        ).catch(error => {
          console.error('removing faild', error)
        })
    })
    .catch(error => {
      console.error(error)
    })
}

const mdataThenMap = aa =>
  aa.map(a => {
    a.metadata = _.reduce(a.metadata, (result, { k, v }) => {
      result[ k ] = v
      return result
    }, {})
    return a
  })

const inspect = _.partialRight(util.inspect, { depth: null, colors: true })
// const updater = _.partial(runsToLatest, c)

const aPath = path.join('.', 'dev_coreData/database(copy)/archives.db')
const asPath = path.join('.', 'dev_coreData/database(copy)/archiveSeeds.db')

const rPath = path.join('.', 'dev_coreData/database(copy)/crawls.db')

let toMove = '/home/john/my-fork-wail/archives2/*'
let moveWhere = '/home/john/Documents/WAIL_ManagedCollections/'

const archives = new DB({
  filename: aPath,
  autoload: true
})

const archiveSeeds = new DB({
  filename: asPath,
  autoload: true
})

const crawls = new DB({
  filename: rPath,
  autoload: true
})

function updateColSize () {
  return new Promise((resolve) => {
    let newCols = []
    const mdataT = (ret, { k, v }) => {
      ret[ k ] = v
      return ret
    }
    const update = (iter, collections, runs) => {
      let { done, value: col } = iter.next()
      if (!done) {
        runs.find({ forCol: col.colName }, (err, colRuns) => {
          if (colRuns.length > 0) {
            let seeds = []
            let rms = []
            colRuns.forEach(cur => {
              if (Array.isArray(cur.urls)) {
                cur.urls.forEach(it => {
                  seeds.push({
                    url: it,
                    jobId: cur.jobId
                  })
                })
              } else {
                seeds.push({
                  url: cur.urls,
                  jobId: cur.jobId
                })
              }
              if (cur.runs.length > 0) {
                rms = rms.concat(cur.runs.map(r => moment(r.timestamp)))
              }
            })
            col.lastUpdated = rms.length > 0 ? moment.max(rms).format() : moment().format()
            col.seeds = transformSeeds(seeds)
          } else {
            col.lastUpdated = moment().format()
            col.seeds = []
          }
          col.created = moment().format()
          let size = 0
          fs.walk(col.archive)
            .pipe(through2.obj(function (item, enc, next) {
              if (!item.stats.isDirectory()) this.push(item)
              next()
            }))
            .on('data', item => {
              size += item.stats.size
            })
            .on('end', () => {
              col.size = prettyBytes(size)
              delete col.crawls
              col.metadata = _.reduce(col.metadata, mdataT, {})
              newCols.push(col)
              update(iter, collections, runs)
            })
        })
      } else {
        console.log(util.inspect(newCols, { depth: null, colors: true }))
        archives.remove({}, { multi: true }, (x, y) => {
          archives.insert(newCols, (erri, newDocs) => {
            console.log(newDocs)
            resolve()
          })
        })
      }
    }

    archives.find({}, (err, collections) => {
      update(updateGen(collections), archives, crawls)
    })
  })

}

function crawlStepUnkown () {
  return new Promise((resolve) => {
    let newCrawls = []
    const update = (iter) => {
      let { done, value: run } = iter.next()
      if (!done) {
        let latestRun = _.find(run.runs, { started: Math.max(...run.runs.map(cr => cr.started)) })
        run.hasRuns = run.runs.length > 0
        delete run.runs
        run.latestRun = latestRun
        newCrawls.push(run)
        update(iter)
      } else {
        crawls.remove({}, { multi: true }, (err, numRemoved) => {
          crawls.insert(newCrawls, (erri, newDocs) => {
            console.log(newDocs)
            resolve()
          })
        })
      }
    }
    crawls.find({}, (err, crawlz) => {
      update(updateGen(crawlz))
    })
  })
}

function archiveUpdate () {
  return new Promise((resolve) => {
    crawls.find({}, (err, crawlz) => {
      let cs = _.keyBy(crawlz, crawl => crawl.jobId)
      let newA = []
      archives.find({}, (erra, archivez) => {
        console.log(inspect(archivez))
        archivez.forEach(ar => {
          // console.log(inpect(ar))
          if (ar.seeds.length > 0) {
            ar.seeds = ar.seeds.map(s => {
              s.added = moment(cs[ Math.min(...s.jobIds) ].jobId).format()
              s.lastUpdated = moment(cs[ Math.max(...s.jobIds) ].latestRun.timestamp).format()
              return s
            })
          }
          ar.hasRunningCrawl = false
          newA.push(ar)
        })
        console.log(inspect(newA))
        archives.remove({}, { multi: true }, (err, numRemoved) => {
          archives.insert(newA, (err) => {
            console.log(err)
            resolve()
          })
        })
      })
    })
  })
}

function archiveSeedsToDb () {
  return new Promise((resolve) => {
    archives.find({}, (erra, archivez) => {
      let colSeeds = []
      archivez.forEach(a => {
        a.seeds.forEach(as => {
          colSeeds.push(Object.assign({}, {
            _id: `${a.colName}-${as.url}`,
            forCol: a.colName,
          }, as))
        })
        delete a.seeds
      })
      archiveSeeds.insert(colSeeds, (erri, ncs) => {
        archives.remove({}, { multi: true }, (errrm) => {
          archives.insert(archivez, (errai, nds) => {
            resolve()
          })
        })
      })
    })
  })
}

updateColSize()
  .then(() =>
    crawlStepUnkown()
      .then(() =>
        archiveUpdate()
          .then(() =>
            archiveSeedsToDb()
              .then(() => {
                console.log('done')
              })
          )
      )
  )


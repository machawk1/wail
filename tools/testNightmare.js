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
const schedule = require('node-schedule')
// */5 * * * *
const Twit = require('twit')

const inspect = _.partialRight(util.inspect, { depth: null, colors: true })

const a = new DB({
  filename: '/home/john/my-fork-wail/dev_coreData/database/archives.db',
  autoload: true
})

const c = new DB({
  filename: '/home/john/my-fork-wail/dev_coreData/database/crawls.db',
  autoload: true
})

function *updateGen (iterate) {
  for (let it of iterate)
    yield it
}

function update (iter, updateFun) {
  let { done, value } = iter.next()
  if (!done) {
    updateFun(value)
      .then(() => {
        update(iter, updateFun)
      })
      .catch(error => {
        console.error(error)
      })
  }
}

const runsToLatest = (db, run) => new Promise((resolve, reject) => {
  run.hasRuns = true
  db.insert(run, (err) => {
    if (err) {
      reject(err)
    } else {
      resolve()
    }
  })
})

const updater = _.partial(runsToLatest, c)
c.find({}, (err, crawls) => {
  // c.remove({}, { multi: true }, function (err, numRemoved) {
  //   update(updateGen(crawls), updater)
  // })
  let cs = _.keyBy(crawls, crawl => crawl.jobId)
  let newA = []
  a.find({}, (erra, archives) => {
    console.log(inpect(archives))
    // archives.forEach(ar => {
    //   // console.log(inpect(ar))
    //   if (ar.seeds.length > 0) {
    //     ar.seeds = ar.seeds.map(s => {
    //       s.added = moment(cs[ Math.min(...s.jobIds) ].jobId).format()
    //       s.lastUpdated = moment(cs[ Math.max(...s.jobIds) ].latestRun.timestamp).format()
    //       return s
    //     })
    //   }
    //   newA.push(ar)
    // })
    // console.log(inpect(newA))
    // a.remove({}, { multi: true }, function (err, numRemoved) {
    //   a.insert(newA, (err) => {
    //     console.log(err)
    //   })
    // })
  })

})




const transformSeeds = seeds => _.chain(seeds)
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

let newCols = []
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
          newCols.push(col)
          update(iter, collections, runs)
        })
    })
  } else {
    console.log(util.inspect(newCols, { depth: null, colors: true }))
    a.remove({}, { multi: true }, (x, y) => {
      a.insert(newCols, (erri, newDocs) => {
        console.log(newDocs)
      })
    })
  }
}

a.find({}, (err, collections) => {
  // console.log(util.inspect(collections, { depth: null, colors: true }))
  update(updateGen(collections), a, c)
  // collections.forEach(col => {
  //   c.find({ forCol: col.colName }, (err, colRuns) => {
  //     console.log(util.inspect(col, { depth: null, colors: true }))
  //     console.log(util.inspect(colRuns, { depth: null, colors: true }))
  //     if (colRuns.length > 0) {
  //       let seeds = colRuns.map(r => r.urls)
  //       console.log(seeds)
  //     } else {
  //       console.log('no seeds')
  //       a.update({ _id: col._id },)
  //     }
  //     console.log('------------------------------')
  //   })
  // })
})
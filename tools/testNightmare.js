import 'babel-polyfill'
import Nightmare from 'nightmare'
import cheerio from 'cheerio'
import S from 'string'
import Promise from 'bluebird'
import rp from "request-promise"
import realFs from 'fs'
import gracefulFs from "graceful-fs"
gracefulFs.gracefulify(realFs)
import fs from 'fs-extra'
Promise.promisifyAll(fs)
import path from 'path'
import _ from 'lodash'
import schedule from 'node-schedule'
import cparser from 'cron-parser'

import {heritrixAccesible} from '../src/js/actions/heritrix-actions'
import {waybackAccesible} from '../src/js/actions/wayback-actions'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

function tNightmare() {

   let nightmare = Nightmare({
      show: true,
      webSecurity: false,
      switches: {
         'ignore-certificate-errors': true
      }
   })

   let auth = "Digest username=\"lorem\", realm=\"Authentication Required\", " +
      "nonce=\"MTQ2NjM2MzMzMzg1NzpmZmY5OTEwZjY1MTdjOTU2ZDc5YWYwZDQ2NzQwZWU1Zg==\", uri=\"/engine\", algorithm=MD5, " +
      "response=\"66996f94a03236c222c1ffed9ac41da1\", qop=auth, nc=0000000a, cnonce=\"5163b2623c10da43\""

   let headers = {
      auth: {
         username: 'lorem',
         password: 'ipsum',
         sendImmediately: false
      },
   }
   nightmare
      .authentication('lorem', 'ipsum')
      .goto("https://localhost:8443/engine")
      .wait('#main')
      .end()
      .then(function (result) {
         console.log(result)
      })
      .catch(function (error) {
         console.error('Search failed:', error);
      })
}
//https://lorem:ipsum@localhost:8443
let optionEngine = {
   method: 'GET',
   uri: `https://localhost:8443/engine`,
   auth: {
      username: 'lorem',
      password: 'ipsum',
      sendImmediately: false
   },
   rejectUnauthorized: false,
   resolveWithFullResponse: true,
   transform: body => cheerio.load(body),
}

function buildJobOptions(jobId) {
   return {
      method: 'GET',
      uri: `https://localhost:8443/engine/job/${jobId}`,
      auth: {
         username: 'lorem',
         password: 'ipsum',
         sendImmediately: false
      },
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
      transform: body => cheerio.load(body),

   }
}

let statues = {
   heritrix: false,
   wayback: false
}
//
heritrixAccesible(false)
   .then(ha => statues.heritrix = ha.status )
   .catch(hdown => statues.heritrix = hdown.status)
   .finally(() =>
      waybackAccesible(false)
         .then(wba => statues.wayback = wba.status)
         .catch(wbdown => statues.wayback = wbdown.status)
         .finally(() => console.log("Done with status checks ",statues))
   )


// const counter = {
//    count: 0
// }
//
// const rule  = schedule.RecurrenceRule()
// rule.second = 10
// const jobStatus = schedule.scheduleJob('*/10    *    *    *    *    *',function () {
//    console.log(counter.count++)
//    if(counter.count > 25)
//       jobStatus.cancel()
// })

// var options = {
//    currentDate: Date.now(),
//    iterator: true
// };
//
// let count = 0
//
// try {
//    var interval = cparser.parseExpression('*/10    *    *    *    *    *', options);
//
//    while (true) {
//       try {
//          if(count > 25)
//             break
//          var obj = interval.next();
//          console.log('value:', obj.value.toString(), 'done:', obj.done);
//          count++
//       } catch (e) {
//          break;
//       }
//    }
//
//    // value: Wed Dec 26 2012 14:44:00 GMT+0200 (EET) done: false
//    // value: Wed Dec 26 2012 15:00:00 GMT+0200 (EET) done: false
//    // value: Wed Dec 26 2012 15:22:00 GMT+0200 (EET) done: false
//    // value: Wed Dec 26 2012 15:44:00 GMT+0200 (EET) done: false
//    // value: Wed Dec 26 2012 16:00:00 GMT+0200 (EET) done: false
//    // value: Wed Dec 26 2012 16:22:00 GMT+0200 (EET) done: true
// } catch (err) {
//    console.log('Error: ' + err.message);
// }

// let $ = cheerio.load(fs.readFileSync(path.resolve(__dirname, "heritrixFront.html"), "utf8"))
//
// let jobs = $("a[href*='/engine/job']").map(function (idx, elem) {
//    return `https://localhost:8443${$(this).attr('href')}`
// }).get()
//
// console.log(jobs)
// console.log(jobs)

// jobs.each(function(idx, elem){
//    console.log($(this).attr('href'))
// })

// rp(optionEngine)
//    .then($ => {
//       console.log($.html())
//    })
//    .catch(err => {
//       console.log(err)
//    })
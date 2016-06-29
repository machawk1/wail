import 'babel-polyfill'
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
import moment from 'moment'
import _ from 'lodash'
import schedule from 'node-schedule'
import cron from 'cron'
import cparser from 'cron-parser'
import child_process from 'child_process'
import drivelist from 'drivelist'
import os from 'os'


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// "http://localhost:8080/wayback/*/" + self.uri.GetValue()
// let base = '.'
// const heritrixJob = path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0/jobs')
// console.log()
// fs.walk(heritrixJob)

let drive = "A:\\wail-electron\\bundledApps\\heritrix.bat -a lorem:ipsum"[0]
console.log(drive)


//A:\wail-electron\bundledApps
/*
 `/${drive} ${path.normalize("A:\\wail-electron\\bundledApps\\heritrix.bat")}`,['-a lorem:ipsum'], (err, stdout, stderr) => {
 console.log(err, stdout, stderr)

 }
 .spawn('cmd.exe',[`/${drive}`,`${path.normalize("A:\\wail-electron\\bundledApps\\heritrix.bat")} -a lorem:ipsum`])

 */

// child_process.exec("heritrix.bat -a lorem:ipsum",{cwd:`${path.normalize("A:\\wail-electron\\bundledApps")}`,shell: 'cmd.exe'}, (err, stdout, stderr) => {
//    console.log(err, stdout, stderr)
//
// })


var heritrixPath = path.normalize("A:\\wail-electron\\bundledApps\\heritrix-3.2.0")
let opts = {
    cwd: heritrixPath,
    env: {
        JAVA_HOME: "A:\\wail-electron\\bundledApps\\openjdk",
        JRE_HOME: "A:\\wail-electron\\bundledApps\\openjdk\\jre",
        HERITRIX_HOME: "A:\\wail-electron\\bundledApps\\heritrix-3.2.0",
    },
    detached: true,
    shell: false,
    stdio: ['ignore', 'ignore', 'ignore']
}
var heritrix = child_process.spawn("bin\\heritrix.cmd", ['-a', 'lorem:ipsum'], opts)
heritrix.unref()
console.log('done')




// console.log('done')

// heritrix.on('exit', function (code) {
//    console.log('child process exited with code ' + code);
// })
//
// setTimeout(function() {
//    console.log('Ending terminal session')
//    heritrix.stdin.write('blah blah\n')
//    heritrix.stdin.end()
//    heritrix.kill()
// }, 2000)


// let command = child_process.spawn('cmd.exe',[`/${drive}`,`${path.normalize("A:\\wail-electron\\bundledApps\\heritrix.bat")} -a lorem:ipsum`])
//
// command.stdout.on('data', function (data) {
//    console.log('stdout: ' + data);
// });
//
// command.stderr.on('data', function (data) {
//    console.log('stderr: ' + data);
// });
//
// command.on('exit', function (code) {
//    console.log('child process exited with code ' + code);
// });
//
// function tNightmare() {
//
//    let nightmare = Nightmare({
//       show: true,
//       webSecurity: false,
//       switches: {
//          'ignore-certificate-errors': true
//       }
//    })
//
//    let auth = "Digest username=\"lorem\", realm=\"Authentication Required\", " +
//       "nonce=\"MTQ2NjM2MzMzMzg1NzpmZmY5OTEwZjY1MTdjOTU2ZDc5YWYwZDQ2NzQwZWU1Zg==\", uri=\"/engine\", algorithm=MD5, " +
//       "response=\"66996f94a03236c222c1ffed9ac41da1\", qop=auth, nc=0000000a, cnonce=\"5163b2623c10da43\""
//
//    let headers = {
//       auth: {
//          username: 'lorem',
//          password: 'ipsum',
//          sendImmediately: false
//       },
//    }
//    nightmare
//       .authentication('lorem', 'ipsum')
//       .goto("https://localhost:8443/engine")
//       .wait('#main')
//       .end()
//       .then(function (result) {
//          console.log(result)
//       })
//       .catch(function (error) {
//          console.error('Search failed:', error);
//       })
// }
// //https://lorem:ipsum@localhost:8443
// let optionEngine = {
//    method: 'GET',
//    uri: `https://localhost:8443/engine`,
//    auth: {
//       username: 'lorem',
//       password: 'ipsum',
//       sendImmediately: false
//    },
//    rejectUnauthorized: false,
//    resolveWithFullResponse: true,
//    transform: body => cheerio.load(body),
// }
//
// function buildJobOptions(jobId) {
//    return {
//       method: 'GET',
//       uri: `https://localhost:8443/engine/job/${jobId}`,
//       auth: {
//          username: 'lorem',
//          password: 'ipsum',
//          sendImmediately: false
//       },
//       rejectUnauthorized: false,
//       resolveWithFullResponse: true,
//       transform: body => cheerio.load(body),
//
//    }
// }
//
// let statues = {
//    heritrix: false,
//    wayback: false
// }
// //
// heritrixAccesible(false)
//    .then(ha => statues.heritrix = ha.status )
//    .catch(hdown => statues.heritrix = hdown.status)
//    .finally(() =>
//       waybackAccesible(false)
//          .then(wba => statues.wayback = wba.status)
//          .catch(wbdown => statues.wayback = wbdown.status)
//          .finally(() => console.log("Done with status checks ",statues))
//    )
var options = {
    currentDate: Date.now(),
    iterator: true
};
let count = 0
//
// try {
//    var interval = cparser.parseExpression('*/10 * * * * *', options);
//
//    while (true) {
//       try {
//          if (count > 25)
//             break
//          var obj = interval.next();
//          console.log('value:', obj.value.toString(), 'done:', obj.done);
//          count++
//       } catch (e) {
//          break;
//       }
//    }
// } catch (err) {
//    console.log('Error: ' + err.message);
// }

// let c1 = 0
// let j1 = new cron.CronJob('*/1 * * * * *',() =>{
//    console.log("job1: ",c1++,moment(Date.now()).format("MM/DD/YYYY h:mm:ssa"))
//    if(c1 > 25)
//       j1.stop()
// },null, true)
//
// let c2 = 0
// let j2 = new cron.CronJob('*/1 * * * *',() =>{
//    console.log("job2: ",c2++,moment(Date.now()).format("MM/DD/YYYY h:mm:ssa"))
//    if(c2 > 25)
//       j2.stop()
// },null, true)
//
//
// let c3 = 0
// let j3 = new cron.CronJob('*/1 * * * *',() =>{
//    console.log("job3: ",c3++,moment(Date.now()).format("MM/DD/YYYY h:mm:ssa"))
//    if(c3 > 25)
//       j3.stop()
// },null, true)

// let c1 = 0
// let c2 = 0
// let c3 = 0
// let c4 = 0
//
// let rule  = new schedule.RecurrenceRule()
// let rule2  = new schedule.RecurrenceRule()
// let rule3 = new schedule.RecurrenceRule()
// let rule4  = new schedule.RecurrenceRule()
//
// rule.second = [0, 10, 20,30,40, 50]
// rule2.second = [0, 10, 20,30,40, 50]
// rule3.second =  [0, 10, 20,30,40, 50]
// rule4.second =  [0, 10, 20,30,40, 50]
// const jobStatus = schedule.scheduleJob(rule,function () {
//    console.log("job1: ",c1++)
//    if(c1 > 25)
//       jobStatus.cancel()
// })
//
// const jobStatus2 = schedule.scheduleJob(rule2,function () {
//    console.log("job2: ",c2++)
//    if(c2 > 25)
//       jobStatus2.cancel()
// })
//
// const jobStatus3 = schedule.scheduleJob(rule3,function () {
//    console.log("job3: ",c3++)
//    if(c3 > 25)
//       jobStatus3.cancel()
// })
//
// const jobStatus4 = schedule.scheduleJob(rule4,function () {
//    console.log("job4: ",c4++)
//    if(c4 > 25)
//       jobStatus4.cancel()
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
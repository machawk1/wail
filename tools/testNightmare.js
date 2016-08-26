import 'babel-polyfill'
import Promise from 'bluebird'
import cp from 'child_process'
import fs from 'fs-extra'
import named from 'named-regexp'
import S from 'string'
import util from 'util'
import got from 'got'
import request from 'request'
import rp from 'request-promise'
import FormData from 'form-data'
import crypto from 'crypto'
import through2 from 'through2'
import shelljs from 'shelljs'
Promise.promisifyAll(fs)
import ipc from 'node-ipc'


const ipcDaemon = new ipc.IPC()

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
//
// let options = {
//   method: "POST",
//   url: "https://localhost:8443/engine/job/1468042466879",
//   form: {
//     action: "launch"
//   },
//   auth: {
//     username: "lorem",
//     password: "ipsum",
//     sendImmediately: false
//   },
//   rejectUnauthorized: false,
//   resolveWithFullResponse: true,
// }
// rp(options)
//   .then(response => {
//     // POST succeeded...
//     console.log("sucess in launching job", response)
//   })
//   .catch(err => {
//     if (err.statusCode == 303) {
//       console.log("303 sucess in launch job", err)
//     } else {
//       // POST failed...
//       console.log("failur in launching job", err)
//     }
//   })

//
// var spawn = require('child_process').spawn('java', ['-version']);
// spawn.on('error', function(err){
//   return callback(err, null);
// })
// spawn.stderr.on('data', function(data) {
//   data = data.toString().split('\n')[0];
//   var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
//   if (javaVersion != false) {
//     // TODO: We have Java installed
//     console.log(javaVersion)
//   } else {
//     // TODO: No Java installed
//     console.log('no java')
//
//   }
// })

// let good_jdk = ['/Library/Java/JavaVirtualMachines/jdk1.7.0_79.jdk','/Library/Java/JavaVirtualMachines/jdk1.7.0_80.jdk']


// let havaJava = null// shelljs.which('java')
//
// if(havaJava) {
//   console.log(`which java ${havaJava}`)
// } else {
//   console.log('its nul')
// }

// // (:<jvm>*.jre|jdk)
// let jvmRegex = named.named(/\/[a-zA-z/]+(:<jvm>.+)/)
// let jvRegex = named.named(/java version "(:<jv>[0-9._]+)"/g)
// // let jvms = shelljs.ls('-d','/Library/Java/JavaVirtualMachines/*.jdk')
//
// let it = ' '
// console.log(it)
// let jvTest = jvRegex.exec(it)
// if(jvTest) {
//   console.log(jvTest.capture('jv'))
// } else {
//   console.log('fail')
// }
// const osx_java7DMG = 'http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg'
// ///Users/jberlin/WebstormProjects/wail/support
// request.get(osx_java7DMG)
//   .on('response', res => {
//   console.log(res.statusCode) // 200
//   console.log(res.headers['content-type'])
// }).on('error', err => {
//   console.error(err)
// }).pipe(fs.createWriteStream('/Users/jberlin/WebstormProjects/wail/support/java7.dmg'))
//   .on('close',() => {
//     console.log('done')
//
//   })

// cp.exec('hdiutil attach /Users/jberlin/WebstormProjects/wail/support/java7.dmg', (err, stdout, stderr) => {
//   if(err) {
//     console.error(err)
//   } else {
//     console.log(stderr,stdout)
//     cp.exec('open JDK 7 Update 79.pkg',{cwd: '/Volumes/JDK 7 Update 79/'})
//   }
// })

cp.exec('open /Volumes/JDK\\ 7\\ Update\\ 79/JDK\\ 7\\ Update\\ 79.pkg', (err, stdout, stderr) => {
  if(err) {
    console.error(err)
  } else {
    console.log(stderr,stdout)
    // cp.exec('open JDK 7 Update 79.pkg',{cwd: '/Volumes/JDK 7 Update 79/'})
  }
})
//
// let open = cp.spawn('open',['JDK\\ 7\\ Update\\ 79.pkg'],{cwd: '/Volumes/JDK\\ 7\\ Update\\ 79'})
//
// open.stdout.on('data', (data) => {
//   console.log(data)
// });
//
// open.stderr.on('data', (data) => {
//   console.error(`ps stderr: ${data}`);
// });
//
// open.on('close', (code) => {
//   if (code !== 0) {
//     console.log(`ps process exited with code ${code}`);
//   }
//   open.stdin.end();
// });
// console.log(jvms.length)
//
// jvms.forEach(jvm => {
//   console.error(jvm)
//   let jvmTest = jvmRegex.exec(jvm)
//   if(jvmTest) {
//     console.log(jvmTest.capture('jvm'))
//   }
//
// })
//
// console.log(shelljs.which('mvn'))


// try {
//   fs.statSync('/Library/Java/JavaVirtualMachines/jdk1.7.0_79.jdk')
// } catch(doesNotExist) {
//   console.log(doesNotExist)
// }

// fs.stat('/Library/Java/JavaVirtualMachines/jdk1.7.0_79.jdk',(err,stat) => {
//   if(err) {
//     fs.stat('/Library/Java/JavaVirtualMachines/jdk1.7.0_80.jdk',(err2,stat2) => {
//       if(err2) {
//         console.log('java 7 not installed')
//       } else {
//         console.log('java 7u80 is installed')
//       }
//     })
//   } else {
//     console.log('java 7u79 is installed')
//   }
// })


// fs.stat('/Library/Java/JavaVirtualMachines/jdk1.8.0_72.jdk',(err,stat) => {
//   if(err) {
//     console.log('it does not exists')
//   } else {
//     console.log('it does',util.inspect(stat,{colors: true, depth: null}))
//   }
// })

// let count = 0
// cp.exec('java -version',(err,stdout,stderr) => {
//   let javaVersion = /java version/.test(stderr) ? stderr.split(' ')[2].replace(/"/g, '') : false
//   count += 1
//   if (javaVersion != false) {
//     // TODO: We have Java installed
//     console.log(javaVersion)
//     let jv = S(javaVersion)
//     if(jv.contains('1.7')) {
//       console.log('you have 1.7')
//     } else {
//       console.log('not 1.7ß')
//     }
//   } else {
//     console.log('no java')
//
//   }
//
//   console.log(count)
// })
//
// console.log(util.inspect(process.env,{colors: true, depth: null}))
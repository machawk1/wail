// const AutoIndexer = require('../wail-core/autoIndexer/autoIndexer')
const klaw = require('klaw')
const fs = require('fs-extra')
const chokidar = require('chokidar')
const path = require('path')
const cp = require('child_process')

// let autoIndexer = new AutoIndexer()
//
// autoIndexer.onMessage({
//   type: 'init',
//   pywb: '/home/john/my-fork-wail/bundledApps/pywb',
//   colPs: []
// })

console.log()
const colPath = '/home/john/Documents/WAIL_ManagedCollections/collections'
let exec = '/home/john/my-fork-wail/bundledApps/pywb/wayback'
let opts = {
  cwd: '/home/john/my-fork-wail/bundledApps/pywb',
  detached: true,
  shell: true,
  env: process.env
}
let wayback = cp.spawn(exec, ['-d', '/home/john/Documents/WAIL_ManagedCollections'], opts)
wayback.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

wayback.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});
// // klaw('',{fs})
// const watcher = chokidar.watch(path.join(colPath, '**', 'archive', '*'), {ignoreInitial: true})
// watcher.on('add', filePath => {
//   let dn = path.dirname(filePath)
//   console.log('add', filePath)
//   console.log('add', path.dirname(filePath))
//   console.log(path.join(dn, '../'))
//   console.log(path.join(dn, `..${path.sep}`, 'indexes', 'all.cdxj'))
//   let indexing = cp.spawn(
//     '/home/john/my-fork-wail/bundledApps/pywb/index.sh',
//     [path.dirname(filePath), path.join(dn, '../', 'indexes', 'all.cdxj')]
//   )
//   // let sorting = cp.spawn('sort', {
//   //   env: Object.assign({'LC_ALL': 'c'}, process.env),
//   //   stdio: [indexing.stdout, 'pipe', 'pipe']
//   // })
//
//   indexing.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });
//
//   indexing.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
//   });
//
//   indexing.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
//   indexing.on('error', (err) => {
//     console.error('Failed to start child process.', err);
//   })
// })
// watcher.on('change', filePath => {
//   let dn = path.dirname(filePath)
//   console.log('change', filePath)
//   console.log('change', path.dirname(filePath))
//   console.log(path.join(dn, '../'))
//   console.log(path.join(dn, `..${path.sep}`, 'indexes', 'all.cdxj'))
//   let indexing = cp.spawn(
//     '/home/john/my-fork-wail/bundledApps/pywb/index.sh',
//     [path.dirname(filePath), path.join(dn, '../', 'indexes', 'all.cdxj')]
//   )
//   // let sorting = cp.spawn('sort', {
//   //   env: Object.assign({'LC_ALL': 'c'}, process.env),
//   //   stdio: [indexing.stdout, 'pipe', 'pipe']
//   // })
//
//   indexing.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });
//
//   indexing.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
//   });
//
//   indexing.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
//   indexing.on('error', (err) => {
//     console.error('Failed to start child process.', err);
//   })
// })
// watcher.on('unlink', filePath => {
//   let dn = path.dirname(filePath)
//   console.log('unlink', filePath)
//   console.log('unlink', path.dirname(filePath))
//   console.log(path.join(dn, '../', 'indexes', 'all.cdxj'))
//   // '-j', `${path.dirname(filePath)} | sort > ${path.join(dn, '../', 'indexes', 'all.cdxj')}`
//
//   let indexing = cp.spawn(
//     '/home/john/my-fork-wail/bundledApps/pywb/index.sh',
//     [path.dirname(filePath), path.join(dn, '../', 'indexes', 'all.cdxj')]
//   )
//   // let sorting = cp.spawn('sort', {
//   //   env: Object.assign({'LC_ALL': 'c'}, process.env),
//   //   stdio: [indexing.stdout, 'pipe', 'pipe']
//   // })
//
//   indexing.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });
//
//   indexing.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
//   });
//
//   indexing.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
//   indexing.on('error', (err) => {
//     console.error('Failed to start child process.', err);
//   })
// })
// watcher.on('error', (err) => {
//   console.error(err)
// })
// const doIT = async () => {
//   await madge('wail-ui/background/js/archiver.js', {
//     backgroundColor: '#ffffff',
//     nodeColor: '#5d4037',
//     noDependencyColor: '#2196f3',
//     edgeColor: '#263238'
//   })
//     .then((res) => res.image('structureGraphs/browserCrawler.png'))
//     .then((writtenImagePath) => {
//       console.log('Image written to ' + writtenImagePath);
//     })
//
//   // await madge('wail-ui/wail.js', {
//   //   layout: 'sfdp',
//   //   backgroundColor: '#ffffff',
//   //   nodeColor: '#5d4037',
//   //   noDependencyColor: '#2196f3',
//   //   edgeColor: '#263238'
//   // })
//   //   .then((res) => res.image('structureGraphs/wail-ui.png'))
//   //   .then((writtenImagePath) => {
//   //     console.log('Image written to ' + writtenImagePath);
//   //   })
//   //
//   // await madge('wail-ui/loadingScreens/notFirstTime/notFirstLoad.js', {
//   //   layout: 'sfdp',
//   //   backgroundColor: '#ffffff',
//   //   nodeColor: '#5d4037',
//   //   noDependencyColor: '#2196f3',
//   //   edgeColor: '#263238'
//   // })
//   //   .then((res) => res.image('structureGraphs/notFirstTimeLoad.png'))
//   //   .then((writtenImagePath) => {
//   //     console.log('Image written to ' + writtenImagePath);
//   //   })
//   //
//   // await  madge('wail-ui/loadingScreens/firstTime/loadingScreen.js', {
//   //   layout: 'sfdp',
//   //   backgroundColor: '#ffffff',
//   //   nodeColor: '#5d4037',
//   //   noDependencyColor: '#2196f3',
//   //   edgeColor: '#263238'
//   // })
//   //   .then((res) => res.image('structureGraphs/firstTimeLoad.png'))
//   //   .then((writtenImagePath) => {
//   //     console.log('Image written to ' + writtenImagePath);
//   //   })
//   //
//   // await  madge('wail-ui/background/js/twitterM.js', {
//   //   backgroundColor: '#ffffff',
//   //   nodeColor: '#5d4037',
//   //   noDependencyColor: '#2196f3',
//   //   edgeColor: '#263238'
//   // })
//   //   .then((res) => res.image('structureGraphs/twitterMonitor.png'))
//   //   .then((writtenImagePath) => {
//   //     console.log('Image written to ' + writtenImagePath);
//   //   })
//   //
//   // await  madge('wail-ui/background/js/crawls.js', {
//   //   backgroundColor: '#ffffff',
//   //   nodeColor: '#5d4037',
//   //   noDependencyColor: '#2196f3',
//   //   edgeColor: '#263238'
//   // })
//   //   .then((res) => res.image('structureGraphs/crawlMan.png'))
//   //   .then((writtenImagePath) => {
//   //     console.log('Image written to ' + writtenImagePath);
//   //   })
//   //
//   // await  madge('wail-ui/background/js/archives.js', {
//   //   backgroundColor: '#ffffff',
//   //   nodeColor: '#5d4037',
//   //   noDependencyColor: '#2196f3',
//   //   edgeColor: '#263238'
//   // })
//   //   .then((res) => res.image('structureGraphs/archiveMan.png'))
//   //   .then((writtenImagePath) => {
//   //     console.log('Image written to ' + writtenImagePath);
//   //   })
//   //
//   // await  madge('/home/john/my-fork-wail/wail-twitter/monitor/twitterMonitor.js', {
//   //   backgroundColor: '#ffffff',
//   //   nodeColor: '#5d4037',
//   //   noDependencyColor: '#2196f3',
//   //   edgeColor: '#263238'
//   // })
//   //   .then((res) => res.image('wail-twitter-monitor.png'))
//   //   .then((writtenImagePath) => {
//   //     console.log('Image written to ' + writtenImagePath);
//   //   })
//   //
//   // await madge('/home/john/my-fork-wail/wail-ui/ui-main.js', {
//   //   backgroundColor: '#ffffff',
//   //   nodeColor: '#3e2723',
//   //   noDependencyColor: '#2196f3',
//   //   edgeColor: '#263238'
//   // })
//   //   .then((res) => res.image('wail-electron-entry.png'))
//   //   .then((writtenImagePath) => {
//   //     console.log('Image written to ' + writtenImagePath);
//   //   })
// }
//
// doIT().then(() => {
//   console.log('done')
// }).catch(error => {
//   console.error(error)
// })
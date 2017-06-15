const fs = require('fs-extra')
const madge = require('madge')

// madge('/home/john/my-fork-wail/wail-ui/wail.js').then((res) => res.dot())
//   .then((output) => fs.writeFile('wail-ui.dot', output))
//   .then(() => {
//     console.log('done')
//   })

const doIT = async () => {
  await madge('wail-ui/background/js/archiver.js', {
    backgroundColor: '#ffffff',
    nodeColor: '#5d4037',
    noDependencyColor: '#2196f3',
    edgeColor: '#263238'
  })
    .then((res) => res.image('structureGraphs/browserCrawler.png'))
    .then((writtenImagePath) => {
      console.log('Image written to ' + writtenImagePath);
    })

  // await madge('wail-ui/wail.js', {
  //   layout: 'sfdp',
  //   backgroundColor: '#ffffff',
  //   nodeColor: '#5d4037',
  //   noDependencyColor: '#2196f3',
  //   edgeColor: '#263238'
  // })
  //   .then((res) => res.image('structureGraphs/wail-ui.png'))
  //   .then((writtenImagePath) => {
  //     console.log('Image written to ' + writtenImagePath);
  //   })
  //
  // await madge('wail-ui/loadingScreens/notFirstTime/notFirstLoad.js', {
  //   layout: 'sfdp',
  //   backgroundColor: '#ffffff',
  //   nodeColor: '#5d4037',
  //   noDependencyColor: '#2196f3',
  //   edgeColor: '#263238'
  // })
  //   .then((res) => res.image('structureGraphs/notFirstTimeLoad.png'))
  //   .then((writtenImagePath) => {
  //     console.log('Image written to ' + writtenImagePath);
  //   })
  //
  // await  madge('wail-ui/loadingScreens/firstTime/loadingScreen.js', {
  //   layout: 'sfdp',
  //   backgroundColor: '#ffffff',
  //   nodeColor: '#5d4037',
  //   noDependencyColor: '#2196f3',
  //   edgeColor: '#263238'
  // })
  //   .then((res) => res.image('structureGraphs/firstTimeLoad.png'))
  //   .then((writtenImagePath) => {
  //     console.log('Image written to ' + writtenImagePath);
  //   })
  //
  // await  madge('wail-ui/background/js/twitterM.js', {
  //   backgroundColor: '#ffffff',
  //   nodeColor: '#5d4037',
  //   noDependencyColor: '#2196f3',
  //   edgeColor: '#263238'
  // })
  //   .then((res) => res.image('structureGraphs/twitterMonitor.png'))
  //   .then((writtenImagePath) => {
  //     console.log('Image written to ' + writtenImagePath);
  //   })
  //
  // await  madge('wail-ui/background/js/crawls.js', {
  //   backgroundColor: '#ffffff',
  //   nodeColor: '#5d4037',
  //   noDependencyColor: '#2196f3',
  //   edgeColor: '#263238'
  // })
  //   .then((res) => res.image('structureGraphs/crawlMan.png'))
  //   .then((writtenImagePath) => {
  //     console.log('Image written to ' + writtenImagePath);
  //   })
  //
  // await  madge('wail-ui/background/js/archives.js', {
  //   backgroundColor: '#ffffff',
  //   nodeColor: '#5d4037',
  //   noDependencyColor: '#2196f3',
  //   edgeColor: '#263238'
  // })
  //   .then((res) => res.image('structureGraphs/archiveMan.png'))
  //   .then((writtenImagePath) => {
  //     console.log('Image written to ' + writtenImagePath);
  //   })
  //
  // await  madge('/home/john/my-fork-wail/wail-twitter/monitor/twitterMonitor.js', {
  //   backgroundColor: '#ffffff',
  //   nodeColor: '#5d4037',
  //   noDependencyColor: '#2196f3',
  //   edgeColor: '#263238'
  // })
  //   .then((res) => res.image('wail-twitter-monitor.png'))
  //   .then((writtenImagePath) => {
  //     console.log('Image written to ' + writtenImagePath);
  //   })
  //
  // await madge('/home/john/my-fork-wail/wail-ui/ui-main.js', {
  //   backgroundColor: '#ffffff',
  //   nodeColor: '#3e2723',
  //   noDependencyColor: '#2196f3',
  //   edgeColor: '#263238'
  // })
  //   .then((res) => res.image('wail-electron-entry.png'))
  //   .then((writtenImagePath) => {
  //     console.log('Image written to ' + writtenImagePath);
  //   })
}

doIT().then(() => {
  console.log('done')
}).catch(error => {
  console.error(error)
})
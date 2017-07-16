import {
  getExtNameString,
  extLookUpString,
  smoothScrollString,
  killAllJsAlertPromptConfirm
} from './helpers'

function metaData () {
  var outlinks = []
  var nn
  $x('//img|//link|//script|//a').forEach(it => {
    nn = it.nodeName
    if (nn === 'LINK') {
      if (it.href !== '') {
        outlinks.push(`${it.href} E link/@href\r\n`)
      }
    } else if (nn === 'IMG') {
      if (it.src !== '') {
        outlinks.push(`${it.src} E =EMBED_MISC\r\n`)
      }
    } else if (nn === 'SCRIPT') {
      if (it.src !== '') {
        outlinks.push(`${it.src} E script/@src\r\n`)
      }
    } else {
      if (it.href !== '') {
        outlinks.push(`outlink: ${it.href} L a/@href\r\n`)
      }
    }
  })
  return {outlinks: outlinks.join('')}
}

function metaDataSameD (extLookup, extname) {
  var ignore = ['#', 'about:', 'data:', 'mailto:', 'javascript:', 'js:', '{', '*']
  var len = ignore.length
  var outlinks = []
  var curHost = window.location.host
  var links = new Set()
  var i = 0
  var ignored = false
  var test
  var nn
  $x('//img|//link|//script|//a').forEach(it => {
    nn = it.nodeName
    if (nn === 'LINK') {
      if (it.href !== '') {
        outlinks.push(`${it.href} E link/@href\r\n`)
      }
    } else if (nn === 'IMG') {
      if (it.src !== '') {
        outlinks.push(`${it.src} E =EMBED_MISC\r\n`)
      }
    } else if (nn === 'SCRIPT') {
      if (it.src !== '') {
        outlinks.push(`${it.src} E script/@src\r\n`)
      }
    } else {
      test = it.href
      if (test !== '') {
        ignored = false
        i = 0
        for (; i < len; ++i) {
          if (test.indexOf(ignore[i]) !== -1) {
            ignored = true
            break
          }
        }
        if (!ignored && it.host === curHost && test !== window.location.href) {
          if (test.endsWith('/')) {
            test = test.substr(0, test.length - 1)
          }
          if (!extLookup[extname(test)]) {
            links.add(it.href)
          }
        }
        outlinks.push(`outlink: ${it.href} L a/@href\r\n`)
      }
    }
  })
  return {
    outlinks: outlinks.join(''),
    links: [...links]
  }
}

function metaDataAll (extLookup, extname) {
  var ignore = ['#', 'about:', 'data:', 'mailto:', 'javascript:', 'js:', '{', '*']
  var len = ignore.length
  var outlinks = []
  var links = new Set()
  var i = 0
  var ignored = false
  var test
  var nn
  $x('//img|//link|//script|//a').forEach(it => {
    nn = it.nodeName
    if (nn === 'LINK') {
      if (it.href !== '') {
        outlinks.push(`${it.href} E link/@href\r\n`)
      }
    } else if (nn === 'IMG') {
      if (it.src !== '') {
        outlinks.push(`${it.src} E =EMBED_MISC\r\n`)
      }
    } else if (nn === 'SCRIPT') {
      if (it.src !== '') {
        outlinks.push(`${it.src} E script/@src\r\n`)
      }
    } else {
      test = it.href
      if (test !== '') {
        ignored = false
        i = 0
        for (; i < len; ++i) {
          if (test.indexOf(ignore[i]) !== -1) {
            ignored = true
            break
          }
        }
        if (!ignored && test !== window.location.href) {
          if (test.endsWith('/')) {
            test = test.substr(0, test.length - 1)
          }
          if (!extLookup[extname(test)]) {
            links.add(it.href)
          }
          outlinks.push(`outlink: ${it.href} L a/@href\r\n`)
        }
      }
    }
  })
  return {
    outlinks: outlinks.join(''),
    links: [...links]
  }
}

function scrollToBottom () {
  window.scrollTo(0, document.body.scrollHeight)
}

export const metadata = {
  expression: `(${metaData.toString()})()`,
  includeCommandLineAPI: true,
  generatePreview: true,
  returnByValue: true
}

export const metadataSameD = {
  expression: `(${metaDataSameD.toString()})(${extLookUpString},${getExtNameString})`,
  includeCommandLineAPI: true,
  generatePreview: true,
  returnByValue: true
}

export const metadataAll = {
  expression: `(${metaDataAll.toString()})(${extLookUpString},${getExtNameString})`,
  includeCommandLineAPI: true,
  generatePreview: true,
  returnByValue: true
}

export const doScroll = {
  expression: `(${scrollToBottom.toString()})()`
}

export const noNaughtyJS = {
  scriptSource: `(${killAllJsAlertPromptConfirm.toString()})(window);`
}

export function makeSmoothScroll (dur) {
  return {
    expression: `(${smoothScrollString})(${dur})`,
    awaitPromise: true,
    userGesture: true
  }
}

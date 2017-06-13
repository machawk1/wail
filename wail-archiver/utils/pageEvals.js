function killAllJsAlertPromptConfirm (win) {
  Object.defineProperty(win, 'onbeforeunload', {
    configurable: false,
    writeable: false,
    value: function () {}
  })
  Object.defineProperty(win, 'onunload', {
    configurable: false,
    writeable: false,
    value: function () {}
  })
  window.alert = function () {}
  window.confirm = function () {}
  window.prompt = function () {}
  win.alert = function () {}
  win.confirm = function () {}
  win.prompt = function () {}
}

function metaData () {
  var ignore = ["#", "about:", "data:", "mailto:", "javascript:", "js:", "{", "*"]
  var len = ignore.length

  var outlinks = []
  $x('//img').forEach(it => {
    if (it.src !== '') {
      outlinks.push(`${it.src} E =EMBED_MISC\r\n`)
    }
  })
  $x('//script').forEach(it => {
    if (it.src !== '') {
      outlinks.push(`${it.src} E script/@src\r\n`)
    }
  })
  $x('//link').forEach(it => {
    if (it.href !== '') {
      outlinks.push(`${it.href} E link/@href\r\n`)
    }
  })
  var links = new Set()
  var i = 0
  var ignored = false
  Array.from(window.document.links).forEach(it => {
    if (it.href !== '') {
      ignored = false
      i = 0
      for (; i < len; ++i) {
        if (it.href.indexOf(ignore[i]) !== -1) {
          ignored = true
          break
        }
      }
      if (!ignored) {
        links.add(it.href)
      }
      outlinks.push(`outlink: ${it.href} L a/@href\r\n`)
    }
  })
  return {
    outlinks: outlinks.join(''),
    links: [...links]
  }
}

function metaDataSameD () {
  var ignore = ["#", "about:", "data:", "mailto:", "javascript:", "js:", "{", "*"]
  var len = ignore.length
  var outlinks = []
  var curHost = window.location.host
  $x('//img').forEach(it => {
    if (it.src !== '') {
      outlinks.push(`${it.src} E =EMBED_MISC\r\n`)
    }
  })
  $x('//script').forEach(it => {
    if (it.src !== '') {
      outlinks.push(`${it.src} E script/@src\r\n`)
    }
  })
  $x('//link').forEach(it => {
    if (it.href !== '') {
      outlinks.push(`${it.href} E link/@href\r\n`)
    }
  })
  var links = new Set()
  var i = 0
  var ignored = false
  Array.from(window.document.links).forEach(it => {
    if (it.href !== '') {
      ignored = false
      i = 0
      for (; i < len; ++i) {
        if (it.href.indexOf(ignore[i]) !== -1) {
          ignored = true
          break
        }
      }
      if (!ignored && it.host === curHost) {
        links.add(it.href)
      }
      outlinks.push(`outlink: ${it.href} L a/@href\r\n`)
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
  expression: `(${metaDataSameD.toString()})()`,
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
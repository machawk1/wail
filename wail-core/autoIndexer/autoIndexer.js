const ColIndexer = require('./colIndexer')

class AutoIndexer {
  constructor () {
    this.watchers = new Map()
    this.onMessage = this.onMessage.bind(this)
  }

  onMessage (m) {
    switch (m.type) {
      case 'init': {
        const {pywbP, colPs} = m
        colPs.forEach(colP => {
          const aIndexer = new ColIndexer(pywbP, colP)
          this.watchers.set(colP, aIndexer)
          aIndexer.start()
          aIndexer.on('error', err => {
            process.send(err)
          })
          aIndexer.on('indexed', update => {
            process.send(update)
          })

          aIndexer.on('critical-error', err => {
            process.send(err)
            this.watchers.get(err.colP).stop()
            this.watchers.delete(err.colP)
          })
        })
        break
      }
      case 'watchCol': {
        const {pywbP, colP} = m.init
        const aIndexer = new ColIndexer(pywbP, colP)
        this.watchers.set(colP, aIndexer)
        aIndexer.start()
        aIndexer.on('error', err => {
          process.send(err)
        })
        aIndexer.on('indexed', update => {
          process.send(update)
        })

        aIndexer.on('critical-error', err => {
          process.send(err)
          this.watchers.get(err.colP).stop()
          this.watchers.delete(err.colP)
        })
        break
      }
    }
  }

  stop () {
    for (const it of this.watchers.values()) {
      it.stop()
    }
    this.watchers.clear()
  }
}

const autoIndexer = new AutoIndexer()
process.on('message', (m) => {
  console.log(m)
  autoIndexer.onMessage(m)
})

process.on('exit', () => {
  autoIndexer.stop()
})
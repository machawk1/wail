import express from 'express'
import webpack from 'webpack'
import webpackDev from 'webpack-dev-middleware'
import webpackHot from 'webpack-hot-middleware'
import uiDevConfig from '../webpackConfigs/ui/webpack.config'

const port = require('minimist')(process.argv.slice(2)).port

if(port === null) {
  console.error('A port was not specified as an argument. Please rerun with --port [port]')
  process.exit(0)
}

const app = express()
const compile = webpack(uiDevConfig)

const dev = webpackDev(compile,{
  publicPath: uiDevConfig.output.publicPath,
  stats: {
    colors: true
  }
})

app.use(dev)
app.use(webpackHot(compile))

const server = app.listen(port, 'localhost', err => {
  if(err) {
    console.error(err)
    return
  }
  console.log(`UI dev server listening at http://localhost:${port}`)
})

process.on('SIGTERM',() => {
  console.log('Stopping UI dev server')
  dev.close()
  server.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT',() => {
  console.log('Stopping UI dev server')
  dev.close()
  server.close(() => {
    process.exit(0)
  })
})

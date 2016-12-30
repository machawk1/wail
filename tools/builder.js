const webpack = require('webpack')

process.on('message', ({who, path}) => {
  console.log(who, path)
  const config = require(path)
  webpack(config, (err, stats) => {
    if (err) {
      process.send({who, wasError: true, stats})
    } else {
      process.send({who, wasError: false, stats})
    }
  })
})
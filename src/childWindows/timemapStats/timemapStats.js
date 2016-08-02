import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import fs from 'fs-extra'
import S from 'string'
import tld from 'tldjs'
import _ from 'lodash'
import moment from 'moment'
import tm from '../../../test/csodu.timemap.json'

window.React = React

// injectTapEventPlugin()
//
let ScatterPlot = require('react-d3-basic').BarChart
let swapper = S('')

let mementos = tm.mementos.list
mementos.forEach(m => {
  m.datetimeM = moment(m.datetime)
  m.year = m.datetimeM.year()
  m.month = m.datetimeM.month() + 1
  m.archive = tld.getDomain(m.uri)
})
//
//
//
let parser = d3.time.format('%YM%m').parse
let width = 1920, height = 1080, margins = { left: 100, right: 100, top: 50, bottom: 50 },
  x = (d) => {
    console.log(d)
    console.log(parser(d.year))
    return parser(d.year)
  },
  xScale = 'time',
  xLabel = 'Archived Year',
  yLabel = 'Count',
  chartSeries = [ {
    name: 'Count',
    field: 'count'
  } ]

//
//
//
let byYear = _.chain(mementos).groupBy(m => m.datetimeM.year()).value()
// let byYearMonth = _.chain(mementos)
//     .groupBy(m => m.datetimeM.year())
//     .mapValues(byY => _.groupBy(byY, m => m.datetimeM.month()))
//     .value()

let yearData = []
_.forIn(byYear, (v, k) => {
  yearData.push({
    year: v[ 0 ].datetime,
    count: v.length
  })
})
//
// console.log(byYear)
// console.log(byYearMonth)
// //
// // let byYearMonth = _.mapValues(byYear, arr => _.groupBy(arr, m => m.datetimeM.month()))
//
//
//
//
//
ReactDOM.render(
  <ScatterPlot
    margins={margins}
    width={width}
    height={height}
    data={yearData}
    chartSeries={chartSeries}
    x={x}
  >
  </ScatterPlot>,
  document.getElementById('stats'))

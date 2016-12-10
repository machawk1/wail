import React, { Component, PropTypes } from 'react'
import { ipcRenderer as ipc } from 'electron'
import path from 'path'
import { Card, CardHeader } from 'material-ui/Card'
import { joinStrings } from 'joinable'
import BeamMeUpScotty from 'drag-drop'
import moment from 'moment'
import * as notify from '../../../../actions/notification-actions'
import { doSeedExtraction } from '../../../../actions/redux/addSeedFromFs'
import { resetAddFSSeedMessage } from '../../../../actions/redux/addSeedFromFs'
import seedName from './seedName'
import SelectSeed from './selectSeed'

const defaultM = 'File Name with seeds will be displayed below'

const timeStampFinder = (target, seeds) => {
  let len = seeds.length
  let jobId
  for (let i = 0; i < len; ++i) {
    if (seeds[i].url === target) {
      jobId = seeds[i].timestamp
      break
    }
  }
  return jobId
}

const makeLastUpdated = (jobId, fromUtil = false) => {
  let tempM
  if (fromUtil) {
    tempM = moment(jobId, 'YYYYMMDDHHmmss')
    if (!tempM.isValid()) {
      tempM = moment(new Date().getTime())
    }
  } else {
    tempM = moment(jobId)
  }
  return tempM.format()
}

const makeAddConfig = (col, warcSeed, realSeed) => {
  let jobId = timeStampFinder(realSeed, warcSeed)
  let lastUpdated
  if (!jobId) {
    jobId = new Date().getTime()
    lastUpdated = makeLastUpdated(jobId)
  } else {
    lastUpdated = makeLastUpdated(jobId, true)
  }
  return {
    url: realSeed,
    jobId,
    forCol: col,
    lastUpdated,
    added: lastUpdated,
    mementos: 1
  }
}

export default class AddFromFs extends Component {
  static propTypes = {
    col: PropTypes.string.isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.removeWarcAdder = null
    this.state = {
      message: defaultM,
      checkingDone: false,
      warcSeeds: [],
      hadErrors: []
    }
  }

  componentDidMount () {
    if (!this.removeWarcAdder) {
      console.log('attaching warc adder on live dom')
      this.removeWarcAdder = BeamMeUpScotty('#warcUpload', ::this.fileListener)
    } else {
      console.log('we mounted but already have the warc upload listener attached')
    }
  }

  componentWillUnmount () {
    this.removeWarcAdder()
    this.removeWarcAdder = null
  }

  fileListener (files) {
    console.log(`adding warcs maybe to col ${this.props.col}`, files)
    let addMe = []
    let badFiles = new Set()

    files.forEach(f => {
      let ext = path.extname(f.path)
      if (ext === '.warc' || ext === '.arc') {
        addMe.push(f.path)
      } else {
        badFiles.add(ext)
      }
    })

    if (badFiles.size > 0 && addMe.length <= 1) {
      notify.notifyWarning(`Unable to add files with extensions of ${joinStrings(...badFiles, {separator: ','})}`)
    }

    if (addMe.length > 0) {
      notify.notifyInfo(`Determining Seeds for ${addMe.length} ${path.extname(addMe[0])} Files`, true)
      let wpath = addMe[0]
      let mode = 'f'
      if (addMe.length > 1) {
        // wpath = path.dirname(addMe[ 0 ])
        // mode = 'd'
        let message = 'Please add the (W)arcs one by one. This is to ensure they are added correctly'
        notify.notify({
          title: 'Warning',
          level: 'warning',
          autoDismiss: 0,
          message,
          uid: message
        })
      } else {
        this.setState({message: 'Determining seed from added (W)arc'}, () => {
          this.extractSeeds(wpath, mode)
        })
      }
    }
  }

  extractSeeds (wpath, mode = 'f') {
    doSeedExtraction(wpath, mode)
      .then(extractedSeeds => {
        console.log(extractedSeeds.warcSeeds)
        this.setState({
          checkingDone: true,
          warcSeeds: extractedSeeds.warcSeeds,
          hadErrors: extractedSeeds.hadErrors,
          message: defaultM
        })
      })
      .catch(error => {
        console.log('regulare errror')
        console.error(error)
      })
  }

  resetForm () {
    this.context.store.dispatch(resetAddFSSeedMessage())
  }

  addWarcWTrueSeeds (values) {
    const {warcSeeds} = this.state
    const {col} = this.props
    let realSeeds = values.toJS()
    console.log('real seeds', values)
    let addToCol = {
      lastUpdated: moment().format(),
      col,
      seedWarcs: []
    }
    let channel = 'addfs-warcs-to-col'

    if (warcSeeds.length > 1) {
      channel = 'add-multi-warcs-to-col'
      warcSeeds.forEach(ws => {
        let realSeed = realSeeds[seedName(ws.name)]
        if (realSeed) {
          let addConfig = makeAddConfig(col, ws.seeds, realSeed)
          addToCol.seedWarcs.push(addConfig)
        } else {
          throw new Error(`${seedName(ws.name)} had no real seed`)
        }
      })
    } else {
      let realSeed = realSeeds[seedName(warcSeeds[0].name)]
      if (realSeed) {
        addToCol.seed = makeAddConfig(col, warcSeeds[0].seeds, realSeed)
        addToCol.warcs = warcSeeds[0].filep
      } else {
        throw new Error(`${seedName(warcSeeds[0].name)} had no real seed`)
      }
    }
    console.log('add these seeds ', addToCol, channel)
    // ipc.send(channel, addToCol)
    // this.setState({
    //   message: defaultM,
    //   checkingDone: false,
    //   warcSeeds: [],
    //   hadErrors: []
    // }, ::this.resetForm)
  }

  render () {
    const {checkingDone, message} = this.state
    return (
      <div id='warcUpload' style={{width: '100%', height: '100%'}}>
        <Card id='seedListFPContainer' style={{width: 'inherit', height: 'inherit'}}>
          {!checkingDone && <CardHeader title={message}/>}
          {checkingDone && <SelectSeed onSubmit={::this.addWarcWTrueSeeds} {...this.state} />}
        </Card>
      </div>
    )
  }
}

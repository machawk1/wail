import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ipcRenderer as ipc } from 'electron'
import path from 'path'
import { Card, CardHeader } from 'material-ui/Card'
import { joinStrings } from 'joinable'
import BeamMeUpScotty from 'drag-drop'
import moment from 'moment'
import * as notify from '../../../../actions/notification-actions'
import { extractSeeds as doSeedExtraction } from '../../../../../wail-core/util/warcUtils'
import { resetAddFSSeedMessage } from '../../../../actions/addSeedFromFs'
import seedName from './seedName'
import SelectSeed from './selectSeed'
import { addSeedFromFs } from '../../../../constants/uiStrings'

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

function seedExtractionError (error) {
  notify.notifyError(`An error occurred when determining the seeds: ${error}`)
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
    this.defaultM = addSeedFromFs.defaultMessage
    this.state = {
      message: this.defaultM,
      checkingDone: false,
      warcSeeds: [],
      hadErrors: [],
      wpath: '',
      mode: 'f',
    }
    this.resetForm = this.resetForm.bind(this)
    this.fileListener = this.fileListener.bind(this)
    this.addWarcWTrueSeeds = this.addWarcWTrueSeeds.bind(this)
    this.extractSeeds = this.extractSeeds.bind(this)
    this.seedsExtracted = this.seedsExtracted.bind(this)
  }

  componentDidMount () {
    if (!this.removeWarcAdder) {
      console.log('attaching warc adder on live dom')
      this.removeWarcAdder = BeamMeUpScotty('#warcUpload', this.fileListener)
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
    let len = files.length
    let i = 0
    for (; i < len; ++i) {
      let f = files[i]
      let ext = path.extname(f.path)
      if (ext === '.warc' || ext === '.arc') {
        addMe.push(f.path)
      } else {
        badFiles.add(ext)
      }
    }

    if (badFiles.size > 0 && addMe.length <= 1) {
      notify.notifyWarning(addSeedFromFs.badFileTypes(joinStrings(...badFiles, {separator: ','})))
    }

    if (addMe.length > 0) {
      let wpath = addMe[0]
      let mode = 'f'
      if (addMe.length > 1) {
        // wpath = path.dirname(addMe[ 0 ])
        // mode = 'd'
        let message = addSeedFromFs.noDirectory
        notify.notify({
          title: 'Warning',
          level: 'warning',
          autoDismiss: 0,
          message,
          uid: message
        })
      } else {
        notify.notifyInfo(addSeedFromFs.determiningSeedNotif(addMe.length, path.extname(addMe[0])), true)
        this.setState({message: addSeedFromFs.determiningSeedMessage, wpath, mode}, this.extractSeeds)
      }
    }
  }

  seedsExtracted (extractedSeeds) {
    console.log(extractedSeeds.warcSeeds)
    this.setState({
      checkingDone: true,
      warcSeeds: extractedSeeds.warcSeeds,
      hadErrors: extractedSeeds.hadErrors,
      message: this.defaultM,
      wpath: ''
    })
  }

  extractSeeds () {
    doSeedExtraction(this.state.wpath, this.state.mode)
      .then(this.seedsExtracted)
      .catch(seedExtractionError)
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
    ipc.send(channel, addToCol)
    this.setState({
      message: this.defaultM,
      checkingDone: false,
      warcSeeds: [],
      hadErrors: []
    }, this.resetForm)
  }

  render () {
    const {checkingDone, message} = this.state
    return (
      <div id='seedListFPContainer' style={{height: '95%'}}>
        <Card style={{marginLeft: 10, marginRight: 10, minHeight: 400, overflowY: 'auto'}}>
          {!checkingDone && <CardHeader style={{height: 400}} title={message}/>}
          {checkingDone && <SelectSeed
            onSubmit={this.addWarcWTrueSeeds}
            warcSeeds={this.state.warcSeeds}
            hadErrors={this.state.hadErrors}
            checkingDone={this.state.checkingDone}
          />}
        </Card>
      </div>
    )
  }
}

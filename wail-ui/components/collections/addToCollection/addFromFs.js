import React, {Component, PropTypes} from 'react'
import {ipcRenderer as ipc, remote} from 'electron'
import path from 'path'
import {Card, CardHeader} from 'material-ui/Card'
import {joinStrings} from 'joinable'
import BeamMeUpScotty from 'drag-drop'
import moment from 'moment'
import * as notify from '../../../actions/notification-actions'
import {doSeedExtraction} from '../../../actions/redux/addSeedFromFs'
import SeedList from './seedList'
import ErrorList from './errorList'
import seedName from './seedName'
import {resetAddFSSeedMessage} from '../../../actions/redux/addSeedFromFs'

const defaultM = 'File Name with seeds will be displayed below'

const timeStampFinder = (target, seeds) => {
  let len = seeds.length
  let jobId
  for (let i = 0; i < len; ++i) {
    if (seeds[ i ].url === target) {
      jobId = seeds[ i ].timestamp
      break
    }
  }
  return jobId
}

export default class AddFromFs extends Component {
  static propTypes = {
    col: PropTypes.string.isRequired,
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
      hadErrors: [],
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

    if (badFiles.size > 0) {
      notify.notifyWarning(`Unable to add files with extensions of ${joinStrings(...badFiles, { separator: ',' })}`)
    }

    if (addMe.length > 0) {
      notify.notifyInfo(`Determining Seeds for ${addMe.length} ${path.extname(addMe[ 0 ])} Files`, true)
      let wpath = addMe[ 0 ]
      let mode = 'f'
      if (addMe.length > 1) {
        wpath = path.dirname(addMe[ 0 ])
        mode = 'd'
      }
      this.setState({ message: 'Determining seed(s) from added (W)arcs' }, () => {
        this.extractSeeds(wpath, mode)
      })
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

  componentWillUnmount () {
    this.removeWarcAdder()
    this.removeWarcAdder = null
  }

  addWarcWTrueSeeds (values) {
    let readSeeds = values.toJS()
    let addToCol
    let channel = 'add-warcs-to-col'
    let { warcSeeds } = this.state
    if (warcSeeds.length > 1) {
      channel = 'add-multi-warcs-to-col'
      addToCol = {
        lastUpdated: moment().format(),
        col: this.props.col,
        seedWarcs: []
      }
      warcSeeds.forEach(ws => {
        let realSeed = readSeeds[ seedName(ws.name) ]
        let jobId = timeStampFinder(realSeed, ws.seeds)
        addToCol.seedWarcs.push({
          warcs: ws.filep,
          seed: {
            url: realSeed,
            forCol: this.props.col,
            jobId,
            lastUpdated: moment(jobId, 'YYYYMMDDHHmmss').format(), added: addToCol.lastUpdated, mementos: 1
          }
        })
      })
    } else {
      let realSeed = readSeeds[ seedName(warcSeeds[ 0 ].name) ]
      let jobId = timeStampFinder(realSeed, warcSeeds[ 0 ].seeds)
      let lastUpdated = moment().format()
      addToCol = {
        lastUpdated,
        col: this.props.col,
        warcs: warcSeeds[ 0 ].filep,
        seed: {
          url: realSeed,
          jobId,
          forCol: this.props.col,
          lastUpdated: moment(jobId, 'YYYYMMDDHHmmss').format(),
          added: lastUpdated,
          mementos: 1
        }
      }
    }
    console.log('add these seeds ', addToCol, channel)
    ipc.send(channel, addToCol)
    this.setState({
      message: defaultM,
      checkingDone: false,
      warcSeeds: [],
      hadErrors: [],
    }, () => this.context.store.dispatch(resetAddFSSeedMessage()))
  }

  render () {
    const { checkingDone, warcSeeds, message, hadErrors } = this.state
    return (
      <div id='warcUpload' style={{ width: '100%', height: '100%' }}>
        <Card style={{ width: 'inherit', height: 'inherit', overflowY: 'auto' }}>
          {!checkingDone && <CardHeader title={message}/>}
          {checkingDone && <SeedList onSubmit={::this.addWarcWTrueSeeds} warcSeeds={warcSeeds}/>}
          <ErrorList done={checkingDone} hadErrors={hadErrors}/>
        </Card>
      </div>
    )
  }
}

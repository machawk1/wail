import React, {Component, PropTypes} from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {Grid, Row, Col} from 'react-flexbox-grid'
import {
  Step,
  Stepper,
  StepLabel
} from 'material-ui/Stepper'
import ExpandTransition from 'material-ui/internal/ExpandTransition'
import {remote, ipcRenderer} from 'electron'
import CheckServices2 from '../shared/checkServices2'
import LoadingDispatcher from '../shared/loadingDispatcher'
import wc from '../../constants/wail-constants'
import WailInternals from '../shared/wailInterals'
import LoadingStore from '../shared/loadingStore'
import CheckOS from '../firstTime/checkOS2'
import CheckJava from '../firstTime/checkJava2'

const baseTheme = getMuiTheme(lightBaseTheme)
const settings = remote.getGlobal('settings')

const style = {
  container: {
    position: 'relative'
  },
  refresh: {}
}

export default class Loading extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      loading: false,
      finished: false,
      stepIndex: 0
    }
  }

  getChildContext () {
    return { muiTheme: baseTheme }
  }

  componentWillMount () {
    LoadingStore.on('progress', () => {
      this.setState({ stepIndex: this.state.stepIndex + 1 })
    })
  }

  componentWillUnMount () {
    LoadingStore.removeListener('progress', this.updateProgress)
  }

  getStepContent (stepIndex) {
    if (!settings.get('configured')) {
      switch (stepIndex) {
        case 0:
          return (
            <CheckOS />
          )
        case 1:
          return (
            <CheckJava />
          )
        case 2:
          return (
            <CheckServices2 firstLoad wait />
          )
        case 3:
          return (
            <WailInternals />
          )
        default:
          return 'These are the times that try men\'s souls'
      }
    } else {
      console.log('configured loading')
      switch (stepIndex) {
        case 0:
          return (
            <CheckServices2 firstLoad={false} wait={false} />
          )
        case 1:
          return (
            <WailInternals />
          )
        default:
          return (
            <WailInternals />
          )
      }
    }
  }

  renderContent () {
    const { finished, stepIndex } = this.state
    const contentStyle = { margin: '0 16px', overflow: 'hidden' }
    if (finished) {
      return (
        <div style={contentStyle}>
          <p>
            Done! Welcome to WAIL
          </p>
        </div>
      )
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
      </div>
    )
  }

  loadingSteps () {
    if (!settings.get('configured')) {
      return (
        <div>
          <Step>
            <StepLabel>Checking Operating System</StepLabel>
          </Step>
          <Step>
            <StepLabel>Checking Java Version</StepLabel>
          </Step>
          <Step>
            <StepLabel>Ensuring Heritrix and Wayback Are Started</StepLabel>
          </Step>
          <Step>
            <StepLabel>Wail Internals</StepLabel>
          </Step>
        </div>
      )
    } else {
      return (
        <div>
          <Step>
            <StepLabel>Ensuring Heritrix and Wayback Are Started</StepLabel>
          </Step>
          <Step>
            <StepLabel>Wail Internals</StepLabel>
          </Step>
        </div>
      )
    }
  }

  render () {
    const { loading, stepIndex } = this.state
    return (

      <div style={{ width: '100%' }}>
        <h1>Loading Wail</h1>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Ensuring Heritrix and Wayback Are Started</StepLabel>
          </Step>
          <Step>
            <StepLabel>Wail Internals</StepLabel>
          </Step>
        </Stepper>
        <ExpandTransition loading={loading} open>
          {this.renderContent()}
        </ExpandTransition>
      </div>
    )
  }
}

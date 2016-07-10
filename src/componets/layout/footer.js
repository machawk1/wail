import React, {Component} from 'react'
import autobind from 'autobind-decorator'
import Snackbar from 'material-ui/Snackbar'
import schedule from 'node-schedule'
import StatusDialog from '../informational/statusDialog'
import GMessageStore from '../../stores/globalMessageStore'


const interval = [ 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28,
  30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58 ]

const jobHolder = {
  job: null,
  rule: null
}

export default class Footer extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      message: 'Status Number 1',
      open: false,
    }

  }

  componentWillMount () {
    // jobHolder.rule = new schedule.RecurrenceRule()
    // jobHolder.rule.second = interval
  }

  componentWillUnmount () {
    // if (jobHolder.job) {
    //   jobHolder.job.cancel()
    // }
  }

  timerGen () {
    jobHolder.job = schedule.scheduleJob(jobHolder.rule, () => {
      if (GMessageStore.hasQueuedMessages()) {
        this.setState({ message: GMessageStore.getMessage() })
      } else {
        jobHolder.job.cancel()
        jobHolder.job = null
      }
    })
  }

  @autobind
  receiveMessage () {
    this.setState({ message: GMessageStore.getMessage(), open: true })
    this.timerGen()

  }

  @autobind
  closeNotification () {
    this.setState({
      open: false
    })
  }

  render () {
    return (
      <div>
        <StatusDialog />
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2000}
          onRequestClose={this.closeNotification}
        />
      </div>
    )
  }
}

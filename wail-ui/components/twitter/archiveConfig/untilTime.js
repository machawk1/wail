import React, {Component, PropTypes} from 'react'
import TextField from 'material-ui/TextField'
import TimePicker from 'material-ui/TimePicker'
import moment from 'moment/moment'

export default class UntilTime extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      time: '',
      eMessage: '',
      wasError: false
    }
  }

  checkChange (e, time) {
    console.log('time change', time)
    let message = ''
    let wasError = false
    if (time) {
      message = 'Required'
      wasError = true
    } else {
      if (time === '') {
        message = 'Must Choose Stopping Time'
        wasError = true
      } else {
        let now = moment()
        let unitlm = moment(time)
        if (unitlm.isSameOrBefore(now)) {
          message = `Until Must be after time now which ${now.format('h:mma')}`
          wasError = true
          console.log('wasError on timechoices')
        }
      }
    }
    this.setState({ time, message, wasError }, () => {
      if (!wasError) {
        this.props.onChange(time)
      }
    })
  }

  render () {
    return (
      <TimePicker
        floatingLabel='Monitor Until'
        errorText={this.state.wasError && this.state.eMessage}
        onChange={::this.checkChange}
      />
    )
  }
}

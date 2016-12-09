import React, {Component, PropTypes} from 'react'
import TextField from 'material-ui/TextField'

export default class UserNameTF extends Component {
  static propTypes = {
    onBlur: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      uname: ''
    }
  }

  onChange (event) {
    this.setState({
      uname: event.target.value
    })
  }

  render () {
    return (
      <TextField
        name='text-field-controlled'
        floatingLabelText='@ScreenName'
        hintText='WebSciDL'
        value={this.state.uname}
        onChange={::this.onChange}
        onBlur={() => this.props.onBlur(this.state.uname)}
      />
    )
  }
}

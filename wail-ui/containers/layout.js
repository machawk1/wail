import React, {Component, PropTypes} from 'react'
import {blueGrey50, darkBlack, lightBlue900} from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Header from './header2'
import Footer from './footer2'
import {remote} from 'electron'

const baseTheme = getMuiTheme({
  tabs: {
    backgroundColor: blueGrey50,
    textColor: darkBlack,
    selectedTextColor: darkBlack
  },
  inkBar: {
    backgroundColor: lightBlue900
  }
})

export default class Layout extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired
  }
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = { muiTheme: baseTheme }
  }

  getChildContext () {
    return {
      muiTheme: this.state.muiTheme
    }
  }

  render () {
    return (
      <div>
        <Header />
        {this.props.children}
        <Footer />
      </div>
    )
  }
}


import React, {Component, PropTypes} from 'react'
import {darkBlack, lightBlue900, blue500, cyan500, cyan700, white} from 'material-ui/styles/colors'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Header from './header'
import Footer from './footer'
import NewCrawlD from './newCrawlDialog'

const baseTheme = getMuiTheme({
  palette: {
    primary1Color: cyan700,
    primary2Color: blue500
  },
  tabs: {
    backgroundColor: white,
    textColor: darkBlack,
    selectedTextColor: lightBlue900
  },
  inkBar: {
    backgroundColor: lightBlue900
  },
  userAgent: false
})

export default class Layout extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = { muiTheme: baseTheme }
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }

  render () {
    return (
      <div style={{width: '100%', height: '100%'}}>
        <Header />
        <NewCrawlD />
        <Footer />
      </div>
    )
  }
}

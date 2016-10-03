import React, {Component, PropTypes} from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Header from './header'
import Footer from './footer'
import NewCrawlD from './newCrawlDialog'

const baseTheme = getMuiTheme(lightBaseTheme)

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
      <div style={{width: '100%',height: '100%'}}>
        <Header />
        <NewCrawlD />
        <Footer />
      </div>
    )
  }
}


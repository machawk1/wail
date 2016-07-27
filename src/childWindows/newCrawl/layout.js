import React, { Component, PropTypes } from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Header from './header'
import Footer from './footer'
import styles from '../../componets/styles/styles'

const baseTheme = getMuiTheme(lightBaseTheme)

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
    return { muiTheme: this.state.muiTheme }
  }

  render () {
    return (
      <div>
        <Header />
        <div style={styles.root}>
          {this.props.children}
        </div>
        <Footer />
      </div>
    )
  }
}


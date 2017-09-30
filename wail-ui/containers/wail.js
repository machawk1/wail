import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { darkBlack, lightBlue900, blue500, cyan700, white, amber500 } from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import routes from '../routes'
import Footer from '../components/layout/footer'
// import JoyRider from './joyRider'

const wailTheme = getMuiTheme({
  palette: {
    primary1Color: cyan700,
    primary2Color: blue500
  },
  tabs: {
    backgroundColor: cyan700,
    textColor: white,
    selectedTextColor: amber500
  },
  inkBar: {
    backgroundColor: amber500
  },
  overlay: {backgroundColor: 'rgba(0,0,0,0)'},
  userAgent: false
})

// <JoyRider />

export default class Wail extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  componentDidCatch (error, info) {
    console.log(error, info)
  }

  render () {
    const {store, history} = this.props
    return (
      <Provider store={store}>
        <MuiThemeProvider muiTheme={wailTheme}>
          <div style={{width: '100%', height: '100%', position: 'fixed'}}>
            <Router history={history}>
              {routes}
            </Router>
            <Footer/>
          </div>
        </MuiThemeProvider>
      </Provider>
    )
  }
}


import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { darkBlack, lightBlue900, blue500, cyan700, white } from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import routes from '../routes'
import Footer from '../components/layout/footer'

const wailTheme = getMuiTheme({
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

const Wail = ({store, history}) => (
  <Provider store={store}>
    <MuiThemeProvider muiTheme={wailTheme}>
      <div style={{width: '100%', height: '100%'}}>
        <Router history={history}>
          {routes}
        </Router>
        <Footer />
      </div>
    </MuiThemeProvider>
  </Provider>
)

Wail.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

export default Wail

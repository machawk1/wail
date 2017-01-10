import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import { darkBlack, lightBlue900, blue500, cyan700, white } from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Layout from './layout'

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

const NotFirstTime = ({store}) => (
  <Provider store={store}>
    <MuiThemeProvider muiTheme={wailTheme}>
      <Layout />
    </MuiThemeProvider>
  </Provider>
)

NotFirstTime.propTypes = {
  store: PropTypes.object.isRequired
}

export default NotFirstTime

import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import { darkBlack, lightBlue900, blue500, cyan700, white } from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Progress from './progress'

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

const FirstTime = ({ store }) => (
  <Provider store={store}>
    <MuiThemeProvider muiTheme={wailTheme}>
      <div style={{ width: '100%', height: '100%' }}>
        <Progress />
      </div>
    </MuiThemeProvider>
  </Provider>
)

process.NODE_ENV !== 'production' ?
  FirstTime.propTypes = {
    store: PropTypes.object.isRequired,
  } : void 0

export default FirstTime
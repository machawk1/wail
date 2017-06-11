import React from 'react'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { Provider } from 'react-redux'
import configureStore from '../store'
import LoginWebview from '../components/LoginWebview'
import LoadingOrControl from './loadingOrControl'

const store = configureStore()

const muiTheme = getMuiTheme(lightBaseTheme)

export default function LogIn () {
  return (
    <Provider store={store}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="inheritThyWidthHeight">
          <LoginWebview />
          <LoadingOrControl />
        </div>
      </MuiThemeProvider>
    </Provider>
  )
}
import React from 'react'
import { Provider } from 'react-redux'
import configureStore from '../store'
import LoginOverlay from './LoginOverlay'
import LoginWebview from './LoginWebview'

const store = configureStore()

export default function LogIn () {
  return (
    <Provider store={store}>
      <div style={{width: 'inherit', height: 'inherit'}}>
        <LoginOverlay />
        <LoginWebview />
      </div>
    </Provider>
  )
}

import React, {Component} from 'react'
import AppBar from 'material-ui/AppBar'

export default class Header extends Component {
  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return false
  }

  render () {
    return (
      <AppBar
        title='New Crawl Configuration'
        showMenuIconButton={false}
        style={{height: '60px'}}
      />
    )
  }
}

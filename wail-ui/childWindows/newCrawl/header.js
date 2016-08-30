import React, { Component } from 'react'
import AppBar from 'material-ui/AppBar'
import styles from '../../componets/styles/styles'

export default class Header extends Component {
  render () {
    return (
      <AppBar
        title='New Crawl Configuration'
        showMenuIconButton={false}
        zDepth={0}
        style={styles.ncAppBar}
      />
    )
  }
}

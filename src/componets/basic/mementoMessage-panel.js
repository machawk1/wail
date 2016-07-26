import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import S from 'string'
import UrlStore from '../../stores/urlStore'
import styles from '../styles/styles'
import { DefaultMementoMessage, FetchingMementoMessage, MementoCountMessage } from './mementoMessages'

export default class MementoMessagePanel extends Component {
  constructor (props, context) {
    super(props, context)
    let mc = UrlStore.getMementoCount()
    let tState
    this.default = false
    if (S(UrlStore.getUrl()).isEmpty()) {
      this.default = true
      tState = {
        mementoCount: -1
      }
    } else {
      tState = {
        mementoCount: mc
      }
    }
    this.state = tState
  }

  @autobind
  updateMementoCount () {
    this.setState({ mementoCount: UrlStore.getMementoCount() })
  }

  @autobind
  urlUpdated () {
    this.default = S(UrlStore.getUrl()).isEmpty()
    this.setState({ mementoCount: -1 })
  }

  componentDidMount () {
    UrlStore.on('memento-count-updated', this.updateMementoCount)
    UrlStore.on('emptyURL', this.urlUpdated)
    UrlStore.on('memento-count-fetch', this.urlUpdated)
  }

  componentWillUnmount () {
    UrlStore.removeListener('memento-count-updated', this.updateMementoCount)
    UrlStore.removeListener('emptyURL', this.urlUpdated)
    UrlStore.removeListener('memento-count-fetch', this.urlUpdated)
  }

  render () {
    let message
    if (this.default) {
      message = <DefaultMementoMessage />
    } else {
      if (this.state.mementoCount === -1) {
        message = <FetchingMementoMessage />
      } else {
        message = <MementoCountMessage count={this.state.mementoCount} />
      }
    }

    return (
      <div style={styles.mementoMessage}>
        {message}
      </div>
    )
  }
}

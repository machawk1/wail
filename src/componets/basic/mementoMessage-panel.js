import React, {Component} from "react"
import autobind from 'autobind-decorator'
import UrlStore from "../../stores/urlStore"
import styles from "../styles/styles"
import {
  DefaultMementoMessage,
  FetchingMementoMessage,
  MementoCountMessage
} from "./mementoMessages"

let first = true

export default class MementoMessagePanel extends Component {
  constructor (props, context) {
    super(props, context)
    let mc = UrlStore.getMementoCount()
    let tState
    if (first) {
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
    this.setState({ mementoCount: -1 })
  }

  componentDidMount () {
    UrlStore.on('memento-count-updated', this.updateMementoCount)
    UrlStore.on('memento-count-fetch', this.urlUpdated)
  }

  componentWillUnmount () {
    UrlStore.removeListener('memento-count-updated', this.updateMementoCount)
    UrlStore.removeListener('memento-count-fetch', this.urlUpdated)
  }

  render () {
    let message
    if (first) {
      first = false
      message = <DefaultMementoMessage />
    } else {
      if (this.state.mementoCount == -1) {
        message = <FetchingMementoMessage />
      } else {
        message = <MementoCountMessage count={this.state.mementoCount}/>
      }

    }
    return (
        <div style={styles.mementoMessage}>
          { message }
        </div>
    )
  }
}

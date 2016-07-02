import React, { Component } from "react"
import { Row, Column } from "react-cellblock"
import Avatar from 'material-ui/Avatar'
import autobind from 'autobind-decorator'
import CircularProgress from "material-ui/CircularProgress"
import UrlStore from "../../stores/urlStore"
let first = true

export default class MessagePanel extends Component {
  constructor (props, context) {
    super(props, context)
    let mc = UrlStore.getMementoCount()
    let tState
    if (first) {
      tState = {
        mementoCount: -1,
        message: this.defaultMessage()
      }
    } else {
      tState = {
        mementoCount: mc,
        message: mc == -1 ? this.fetchingMementoMsg() : this.gotMementoMsg()
      }
    }
    this.state = tState

  }

  @autobind
  defaultMessage(){
    return (
      <p>
        Enter URL to fetch mementos
      </p>
    )
  }

  @autobind
  fetchingMementoMsg () {
    return (
      <p>
        Fetching memento count
        from public archives...
      </p>
    )
  }

  @autobind
  gotMementoMsg () {
    return (
      <p>
        Mementos available from public archives:
      </p>
    )
  }

  @autobind
  updateMementoCount () {
    this.setState({ mementoCount: UrlStore.getMementoCount(), message: this.gotMementoMsg() })
  }

  @autobind
  urlUpdated () {
    this.setState({ mementoCount: -1, message: this.fetchingMementoMsg() })
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
    let progressOrCount
    if (first) {
      first = false
      progressOrCount = <p></p>
    } else {
      progressOrCount = this.state.mementoCount == -1 ? <CircularProgress size={0.5}/> :
        <p>{this.state.mementoCount}</p>
    }
    return (
        <Row>
          <Column width="1/2">
            {this.state.message}
          </Column>
          <Column width="1/2">
            {progressOrCount}
          </Column>
        </Row>
    )
  }
}

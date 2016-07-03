import React, { Component, PropTypes } from "react"
import { Row, Column } from "react-cellblock"
import Avatar from 'material-ui/Avatar'
import styles from "../styles/styles"

export class DefaultMementoMessage extends Component {
  constructor (props, context) {
    super(props, context)
  }

  render () {
    return (
      <Row>
        <Column width="1/2">
          <p>Enter URL to fetch mementos</p>
        </Column>
        <Column width="1/2">
          <p>0</p>
        </Column>
      </Row>
    )
  }
}

export class FetchingMementoMessage extends Component {
  constructor (props, context) {
    super(props, context)
  }

  render () {
    return (
      <Row>
        <Column width="1/2">
          <p>
            Fetching memento count
            from public archives...
          </p>
        </Column>
        <Column width="1/2">
          <div style={styles.spinningMemento}>
            <Avatar src="icons/mLogo_animated.gif" size={30}/>
          </div>
        </Column>
      </Row>
    )
  }
}

export class MementoCountMessage extends Component {
  static propTypes = {
    count: PropTypes.number.isRequired
  }

  constructor (props, context) {
    super(props, context)
  }

  render () {
    return (
      <Row>
        <Column width="1/2">
          <p>
            Mementos available from public archives:
          </p>
        </Column>
        <Column width="1/2">
          <div style={styles.mementoCount}>
            <p>{this.props.count}</p>
          </div>
        </Column>
      </Row>
    )
  }
}
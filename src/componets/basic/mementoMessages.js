import React, { Component, PropTypes } from 'react'
import { Row, Column } from 'react-cellblock'
import Avatar from 'material-ui/Avatar'
import styles from '../styles/styles'

export class DefaultMementoMessage extends Component {

  render () {
    return (
      <Row>
        <Column width="1/2">
          <p style={styles.cursor}>Enter URL to fetch mementos</p>
        </Column>
        <Column width="1/2">
          <p style={{ paddingLeft: 125, cursor: 'default' }}>0</p>
        </Column>
      </Row>
    )
  }
}

export class FetchingMementoMessage extends Component {

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

  render () {
    return (
      <Row>
        <Column width="1/2">
          <p style={styles.cursor}>
            Mementos available from public archives:
          </p>
        </Column>
        <Column width="1/2">
          <div style={styles.mementoCount}>
            <p style={styles.cursor}>{this.props.count}</p>
          </div>
        </Column>
      </Row>
    )
  }
}

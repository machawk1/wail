import React, { Component, PropTypes } from 'react'
import { Row, Column } from 'react-cellblock'
import Avatar from 'material-ui/Avatar'
import styles from '../styles/styles'

const { fetching } ={
  container: {
    paddingTop: '32px',
    display: 'flex',
    height: '90px',
    flexDirection: 'column'
  },

  fetching: {
    display: 'flex',
    flexDirection: 'row',
    cursor: 'default',
  }
}

const number = {
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: '20px',
  cursor: 'default'
}

export class DefaultMementoMessage extends Component {

  // render () {
  //   return (
  //     <Row>
  //       <Column width="1/2">
  //         <p style={styles.cursor}>Enter URL to fetch mementos</p>
  //       </Column>
  //       <Column width="1/2">
  //         <p style={{ paddingLeft: 125, cursor: 'default' }}>0</p>
  //       </Column>
  //     </Row>
  //   )
  // }

  /*
   <div>
   <div style={styles.cursor}>Enter URL to fetch mementos</div>
   <div style={{ paddingLeft: 125, cursor: 'default' }}>0</div>
   </div>
   */

  render () {
    return (
      <noscript/>
    )
  }
}

export class FetchingMementoMessage extends Component {

  // render () {
  //   return (
  //     <Row>
  //       <Column width="1/2">
  //         <p>
  //           Fetching memento count
  //           from public archives...
  //         </p>
  //       </Column>
  //       <Column width="1/2">
  //         <div style={styles.spinningMemento}>
  //           <Avatar src="icons/mLogo_animated.gif" size={30}/>
  //         </div>
  //       </Column>
  //     </Row>
  //   )
  // }style={{ flex: 1 }

  render () {
    return (
      <div style={fetching}>
        <p style={{ paddingLeft: '20px', width: '60%' }}>
          Retrieving number of publicly available copies
        </p>
        <Avatar style={{ marginTop: '10px' }} src="icons/mLogo_animated.gif" size={30}/>
      </div>
    )
  }
}

export class MementoCountMessage extends Component {
  static propTypes = {
    count: PropTypes.number.isRequired
  }

  // render () {
  //   return (
  //     <Row>
  //       <Column width="1/2">
  //         <p style={styles.cursor}>
  //           Mementos available from public archives:
  //         </p>
  //       </Column>
  //       <Column width="1/2">
  //         <div style={styles.mementoCount}>
  //           <p style={styles.cursor}>{this.props.count}</p>
  //         </div>
  //       </Column>
  //     </Row>
  //   )
  // }

  render () {
    return (
      <p style={number}>
        Publicly available copies: {this.props.count}
      </p>
    )
  }

}

export class MementoAllMessage extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      count: -2,
      url: ' '
    }
  }

  onStart () {
    return (
      <noscript/>
    )
  }

  mementoCounts () {
    var countOrFetching
    if (this.state.count === -1) {
      return <FetchingMementoMessage />
    } else {
      return <MementoCountMessage count={this.state.count}/>
    }
  }

  render () {
    var ret
    if (this.state.count === -2) {
      ret = <noscript/>
    } else {
      if (this.state.count === -1) {
        ret = <FetchingMementoMessage />
      } else {
        ret = <MementoCountMessage count={this.state.count}/>
      }
    }

    return ({ ret })
  }

}

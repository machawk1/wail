import React, {Component} from 'react'
import autobind from 'autobind-decorator'
import UrlStore from '../../../stores/urlStore'
import MemgatorStore from '../../../stores/memgatorStore'
import {FetchingMementoMessage, MementoCountMessage, DefaultMementoMessage} from './mementoMessages'
//
// export default class MementoMessagePanel extends Component {
//   constructor (props, context) {
//     super(props, context)
//     let mc = UrlStore.getMementoCount()
//     let tState
//     this.default = false
//     if (UrlStore.getUrl().isEmpty()) {
//       this.default = true
//       tState = {
//         mementoCount: -1
//       }
//     } else {
//       tState = {
//         mementoCount: mc
//       }
//     }
//     this.state = tState
//   }
//
//   @autobind
//   updateMementoCount () {
//     this.setState({ mementoCount: UrlStore.getMementoCount() })
//   }
//
//   @autobind
//   urlUpdated () {
//     this.default = UrlStore.getUrl().isEmpty()
//     this.setState({ mementoCount: -1 })
//   }
//
//   componentDidMount () {
//     UrlStore.on('memento-count-updated', this.updateMementoCount)
//     UrlStore.on('emptyURL', this.urlUpdated)
//     UrlStore.on('memento-count-fetch', this.urlUpdated)
//   }
//
//   componentWillUnmount () {
//     UrlStore.removeListener('memento-count-updated', this.updateMementoCount)
//     UrlStore.removeListener('emptyURL', this.urlUpdated)
//     UrlStore.removeListener('memento-count-fetch', this.urlUpdated)
//   }
//
//   render () {
//     let message
//     if (this.default) {
//       message = <DefaultMementoMessage />
//     } else {
//       if (this.state.mementoCount === -1) {
//         message = <FetchingMementoMessage />
//       } else {
//         message = <MementoCountMessage count={this.state.mementoCount}/>
//       }
//     }
//
//     return (
//       <div style={styles.mementoMessage}>
//         {message}
//       </div>
//     )
//   }
// }

const { container } = {
  container: {
    marginTop: '5px',
    display: 'flex',
    height: '100px',
    marginBottom: '5px',
    flexDirection: 'column'
  },

  fetching: {
    display: 'flex',
    flexDirection: 'row',
    cursor: 'default'
  }
}

export default class MementoMessagePanel extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      count: MemgatorStore.lastCount()
    }
  }

  componentDidMount () {
    MemgatorStore.on('count-update', this.update)
    UrlStore.on('emptyURL', this.empty)
  }

  componentWillUnmount () {
    MemgatorStore.removeListener('count-update', this.update)
    UrlStore.removeListener('emptyURL', this.empty)
  }

  @autobind
  empty () {
    MemgatorStore.resetCountLast()
    this.setState({
      count: -2
    })
  }

  @autobind
  update (data) {
    this.setState(data)
  }

  render () {
    var ret
    if (this.state.count === -2) {
      ret = <DefaultMementoMessage />
    } else {
      if (this.state.count === -1) {
        ret = <FetchingMementoMessage />
      } else {
        ret = <MementoCountMessage count={this.state.count} />
      }
    }

    return (
      <div style={container}>
        {ret}
      </div>
    )
  }

}

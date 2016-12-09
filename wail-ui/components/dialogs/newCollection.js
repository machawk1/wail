import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {reset as resetForm} from 'redux-form'
import {connect} from 'react-redux'
import {ipcRenderer as ipc} from 'electron'
import Dialog from 'material-ui/Dialog'
import wc from '../../constants/wail-constants'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import NewCollectionForm from './newCollectionForm'

const { QUEUE_MESSAGE } = wc.EventTypes

const dispatchToProps = dispatch => ({
  reset () {
    dispatch(resetForm('newCollection'))
  }
})

class NewCollection extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false
    }
  }

  componentWillMount () {
    ViewWatcher.on('newCollection', ::this.handleOpen)
  }

  componentWillUnmount () {
    ViewWatcher.removeListener('newCollection', ::this.handleOpen)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  cancel () {
    this.setState({ open: false }, ::this.props.reset)
  }

  submit (values) {
    let col = values.get('name')
    let title = values.get('title')
    let description = values.get('description')
    let newCol = {
      col,
      mdata: [ `title="${title}"`, `description="${description}"` ],
      metadata: {
        title,
        description
      }
    }
    console.log('the new collection', newCol)
    ipc.send('create-collection', newCol)
    global.notifications$.next({
      type: QUEUE_MESSAGE,
      message: {
        autoDismiss: 0,
        title: 'Info',
        level: 'info',
        message: `Creating new collection ${col}`,
        uid: `Creating new collection ${col}`
      }
    })
    this.setState({ open: false }, ::this.props.reset)
  }

  handleOpen () {
    this.setState({ open: true })
  }

  render () {
    return (
      <Dialog
        contentStyle={{
          width: '100%',
          maxWidth: 'none'
        }}
        autoScrollBodyContent
        title='New Collection'
        modal
        open={this.state.open}
      >
        <NewCollectionForm onCancel={::this.cancel} onSubmit={::this.submit} />
      </Dialog>

    )
  }
}

export default connect(null, dispatchToProps)(NewCollection)

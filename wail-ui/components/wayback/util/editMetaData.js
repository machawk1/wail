import React, { Component, PropTypes } from 'react'
import Paper from 'material-ui/Paper'
import GMessageDispatcher from '../../../dispatchers/globalMessageDispatcher'
import { Flex, Item } from 'react-flex'
import ViewWatcher from '../../../../wail-core/util/viewWatcher'
import { Editor, EditorState } from 'draft-js'
import { ipcRenderer as ipc } from 'electron'
import Dialog from 'material-ui/Dialog'
import shallowCompare from 'react-addons-shallow-compare'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import S from 'string'
import wc from '../../../constants/wail-constants'

const { QUEUE_MESSAGE } = wc.EventTypes

export default class NewCollection extends Component {

  constructor (...args) {
    super(...args)
    this.state = {
      open: false,
      forCol: '',
      description: '',
      title: '',
      originalTitle: '',
      originalDescription: ''
    }

  }

  componentWillMount () {
    ViewWatcher.on('editMetadata', ::this.handleOpen)
  }

  componentWillUnmount () {
    ViewWatcher.removeListener('editMetadata', ::this.handleOpen)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  cancel () {
    this.setState({
      forCol: '',
      description: '',
      title: '',
      originalTitle: '',
      originalDescription: '',
      open: false
    })
  }

  handleClose () {
    let {
      description,
      title,
      forCol
    } = this.state
    console.log(this.state)
    let swapper = S('')
    let titleEmpty = swapper.setValue(title).isEmpty()
    let descriptEmpty = swapper.setValue(description).isEmpty()
    if (!titleEmpty && !descriptEmpty) {
      let newTitle = this.state.originalTitle !== title
      let newDescription = this.state.originalDescription !== description
      if (newTitle && newDescription) {
        ipc.send('update-metadata', {
          forCol,
          mdataString: `title="${title}" description="${description}"`,
          mdata: [ { k: 'title', v: title }, { k: 'description', v: description } ]
        })
        GMessageDispatcher.dispatch({
          type: QUEUE_MESSAGE,
          message: {
            title: 'Info',
            level: 'info',
            message: `Updating Title and Description for ${forCol}`,
            uid: `Updating Title and Description for ${forCol}`,
          }
        })
      } else {
        if (newTitle) {
          ipc.send('update-metadata', { forCol, mdata: { k: 'title', v: title } })
          GMessageDispatcher.dispatch({
            type: QUEUE_MESSAGE,
            message: {
              title: 'Info',
              level: 'info',
              message: `Updating Title for ${forCol}`,
              uid: `Updating Title for ${forCol}`,
            }
          })
        } else if (newDescription) {
          ipc.send('update-metadata', { forCol, mdata: { k: 'description', v: description } })
          GMessageDispatcher.dispatch({
            type: QUEUE_MESSAGE,
            message: {
              title: 'Info',
              level: 'info',
              message: `Updating Description for ${forCol}`,
              uid: `Updating Description for ${forCol}`,
            }
          })
        }
      }

      this.setState({
        forCol: '',
        description: '',
        title: '',
        originalTitle: '',
        originalDescription: '',
        open: false
      })
    } else {
      GMessageDispatcher.dispatch({
        type: QUEUE_MESSAGE,
        message: {
          title: 'Warning',
          level: 'warning',
          message: `No changes to metadata for ${forCol}`,
          uid: `No changes to metadata for ${forCol}`,
        }
      })
    }
  }

  descriptionChange (event) {
    this.setState({
      description: event.target.value
    })
  }

  titleChange (event) {
    this.setState({
      title: event.target.value
    })
  }

  handleOpen (editMe) {
    let { forCol, title, description } = editMe
    this.setState({
      open: true, forCol, title, description, originalTitle: title,
      originalDescription: description
    })
  }

  render () {
    return (
      <Dialog
        contentStyle={{
          width: '100%',
          maxWidth: 'none',
        }}
        autoScrollBodyContent
        title='Edit Metadata'
        actions={[
          <FlatButton
            label='Cancel'
            onTouchTap={::this.cancel}
          />,
          <FlatButton
            label='Update'
            primary
            onTouchTap={::this.handleClose}
          />
        ]}
        modal
        open={this.state.open}
      >
        <TextField
          ref="cTitle"
          hintText='Defaults to name'
          floatingLabelText='Title'
          value={this.state.title}
          onChange={::this.titleChange}
        />
        <TextField
          fullWidth
          multiLine
          ref="cDescription"
          hintText='Collection Description'
          floatingLabelText='Description'
          value={this.state.description}
          onChange={::this.descriptionChange}
        />
      </Dialog>

    )
  }
}

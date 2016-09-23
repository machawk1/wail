import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import GMessageDispatcher from '../../../dispatchers/globalMessageDispatcher'
import { ipcRenderer as ipc } from 'electron'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import S from 'string'
import wc from '../../../constants/wail-constants'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'

const { QUEUE_MESSAGE } = wc.EventTypes

class NCD extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      col: '',
      description: '',
      title: ''
    }
  }

  cancel () {
    this.setState({
      col: '',
      description: '',
      title: ''
    }, () => {
      this.props.handleClose()
    })
  }

  handleClose () {
    let {
      col,
      description,
      title
    } = this.state
    let swapper = S('')
    let colEmpty = swapper.setValue(col).isEmpty()
    let descriptEmpty = swapper.setValue(description).isEmpty()
    if (!colEmpty && !descriptEmpty) {
      let rt = swapper.setValue(title).isEmpty() ? col : title
      let newCol = {
        col,
        mdata: [ `title=${rt}`, `description=${description}` ],
        metaData: [
          { 'k': 'title', 'v': rt },
          { 'k': 'description', 'v': description }
        ]
      }
      ipc.send('create-collection', newCol)
      GMessageDispatcher.dispatch({
        type: QUEUE_MESSAGE,
        message: {
          autoDismiss: 0,
          title: 'Info',
          level: 'info',
          message: `Creating new collection ${col}`,
          uid: `Creating new collection ${col}`
        }
      })
      this.setState({
        col: '',
        description: '',
        title: ''
      }, () => {
        this.props.handleClose()
      })
    } else {
      let message
      if (colEmpty && !descriptEmpty) {
        message = 'The description can not be empty when creating a new collection!'
      } else if (colEmpty && !descriptEmpty) {
        message = 'The collection name can not be empty when creating a new collection!'
      } else {
        message = 'Both the collection name and description can not be empty when creating a new collection'
      }
      GMessageDispatcher.dispatch({
        type: QUEUE_MESSAGE,
        message: {
          autoDismiss: 0,
          title: 'Warning',
          level: 'warning',
          message,
          uid: message
        }
      })
    }
  }

  nameChange (event) {
    this.setState({
      col: event.target.value
    })
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

  render () {
    const actions = [
      <FlatButton
        label='Cancel'
        onTouchTap={::this.cancel}
      />,
      <FlatButton
        label='Create'
        primary
        onTouchTap={::this.handleClose}
      />
    ]

    return (
      <Dialog
        title='New Collection'
        actions={actions}
        modal
        open={this.props.open}
      >
        <TextField
          ref="cName"
          hintText='Collection Name'
          floatingLabelText='Name'
          value={this.state.col}
          style={{marginRight: '25px'}}
          onChange={::this.nameChange}
        />
        <TextField
          ref="cDescription"
          hintText='Collection Description'
          floatingLabelText='Description'
          value={this.state.description}
          onChange={::this.descriptionChange}
        />
        <TextField
          ref="cTitle"
          hintText='Optional defaults to name'
          floatingLabelText='Title'
          value={this.state.title}
          onChange={::this.titleChange}
        />
      </Dialog>
    )
  }
}
/*
 <div className='contentFab'>
 <FloatingActionButton onTouchTap={() => console.log('fab clicked')}>
 <ContentAdd />
 </FloatingActionButton>
 </div>
 */

export default class NewCollection extends Component {

  constructor (...args) {
    super(...args)
    this.state = {
      open: false,
      col: '',
      description: '',
      title: ''
    }
  }

  handleOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false })
  }

  render () {
    return (
      <div className='contentFab'>
        <FloatingActionButton onTouchTap={::this.handleOpen}>
          <ContentAdd />
        </FloatingActionButton>
        <NCD open={this.state.open} handleClose={::this.handleClose}/>
      </div>

    )
  }
}

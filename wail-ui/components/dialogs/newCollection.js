import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import GMessageDispatcher from '../../dispatchers/globalMessageDispatcher'
import {Flex, Item} from 'react-flex'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import {ipcRenderer as ipc} from 'electron'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import S from 'string'
import wc from '../../constants/wail-constants'

const { QUEUE_MESSAGE } = wc.EventTypes

export default class NewCollection extends Component {

  constructor (...args) {
    super(...args)
    this.state = {
      open: false,
      canSubmit: false,
      col: '',
      description: '',
      title: ''
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
    this.setState({
      col: '',
      description: '',
      title: '',
      open: false
    })
  }

  handleClose () {
    let { col, description, title } = this.state
    let swapper = S('')
    let colEmpty = swapper.setValue(col).isEmpty()
    if(swapper.contains(' ')) {
      global.notifications$.next({
        type: QUEUE_MESSAGE,
        message: {
          autoDismiss: 0,
          title: 'Warning',
          level: 'warning',
          message: 'Pywb does not allow collection names with spaces in the name. We apologize for the inconvenience',
          uid: 'Pywb does not allow collection names with spaces in the name. We apologize for the inconvenience'
        }
      })
    } else {
      let descriptEmpty = swapper.setValue(description).isEmpty()
      if (!colEmpty && !descriptEmpty) {
        let rt = swapper.setValue(title).isEmpty() ? col : title
        let newCol = {
          col,
          mdata: [ `title="${rt}"`, `description="${description}"` ],
          metadata: {
            title: rt,
            description
          }
        }
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
        this.setState({
          col: '',
          description: '',
          title: '',
          open: false
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
        global.notifications$.next({
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
        actions={[
          <FlatButton
            label='Cancel'
            onTouchTap={::this.cancel}
          />,
          <FlatButton
            label='Create'
            primary
            onTouchTap={::this.handleClose}
          />
        ]}
        modal
        open={this.state.open}
      >
        <Flex row alignContent='center' justifyContent='space-between'>
          <TextField
            ref='cName'
            hintText='Collection Name'
            floatingLabelText='Name'
            value={this.state.col}
            style={{ float: 'left', marginRight: '25px' }}
            onChange={::this.nameChange}
          />
          <TextField
            ref='cTitle'
            hintText='Defaults to name'
            floatingLabelText='Title'
            value={this.state.title}
            onChange={::this.titleChange}
          />
        </Flex>
        <TextField
          fullWidth
          multiLine
          ref='cDescription'
          hintText='Collection Description'
          floatingLabelText='Description'
          value={this.state.description}
          onChange={::this.descriptionChange}
        />
      </Dialog>

    )
  }
}

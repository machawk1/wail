import React, { Component } from "react"
import Dialog from "material-ui/Dialog"
import RaisedButton from "material-ui/RaisedButton"
import FlatButton from "material-ui/FlatButton"
import EditorDispatcher from "../../dispatchers/editorDispatcher"
import Editor from "./editor"
import EditorStore from "../../stores/editorStore"
import wc from '../../constants/wail-constants'
import { List, ListItem } from 'material-ui/List'
import Subheader from 'material-ui/Subheader'

const style = {
  dialog: {
    width: '100%',
    maxWidth: 'none',
  },
  button: {
    margin: 12,
  },
  popup: {
    overflowX: "hidden",
    "overflowY": "scroll"
  }
}

export default class EditorPopup extends Component {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    useButton: React.PropTypes.bool.isRequired,
    openFromParent: React.PropTypes.bool,
    onOpenChange: React.PropTypes.func,
    buttonLabel: React.PropTypes.string,
    codeToLoad: React.PropTypes.oneOfType([ React.PropTypes.string, React.PropTypes.object ]).isRequired,
  }

  constructor (props, context) {
    super(props, context)
    let loadCode = this.props.codeToLoad
    console.log(loadCode)

    this.state = {
      open: false,
      codeText: Reflect.has(this.props.codeToLoad, "which") ?
        EditorStore.getCode(loadCode.which, loadCode.jid) : EditorStore.getCode(loadCode.codeToLoad)
    }

    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCodeChange = this.handleCodeChange.bind(this)
    this.saveCode = this.saveCode.bind(this)
    this.storeUpdate = this.storeUpdate.bind(this)

  }

  storeUpdate () {
    console.log('code add')
    this.setState({ codeText: EditorStore.getCode(this.props.codeToLoad) })
  }

  componentWillMount () {
    if (this.props.useButton) {
      EditorStore.on('wbc-fetched', this.storeUpdate)
    }

  }

  componentWillUnmount () {
    if (this.props.useButton) {
      EditorStore.removeListener('wbc-fetched', this.storeUpdate)
    }
  }

  handleOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    if (this.props.useButton) {
      this.setState({ open: false })
    } else {
      this.props.onOpenChange()
    }
  }

  handleCodeChange (codeText) {
    console.log("Code changed")
    this.setState({ codeText })
  }

  saveCode () {
    let savePath = ''
    let which = ''
    if (this.props.useButton) {
      this.setState({ open: false })
      which = this.props.codeToLoad
    } else {
      this.props.onOpenChange()
      savePath = this.props.codeToLoad.codePath
      which = this.props.codeToLoad.which
    }
    console.log(savePath)
    EditorDispatcher.dispatch({
      type: wc.EventTypes.SAVE_CODE,
      which: which,
      savePath: savePath,
      code: this.state.codeText,
      jid: this.props.codeToLoad.jid,
    })

  }

  editorWithButton (actions) {
    return (
      <div>
        <RaisedButton
          label={this.props.buttonLabel}
          onTouchTap={this.handleOpen}
          labelPosition="before"
          primary={true}
          style={style.button}
        />
        <Dialog
          title={this.props.title}
          actions={actions}
          modal={true}
          contentStyle={style.dialog}
          open={this.state.open}
          autoScrollBodyContent={true}
        >
          <Editor
            ref='editor'
            codeText={this.state.codeText}
            onChange={this.handleCodeChange}
          />
          <List style={style.popup}>
            <Subheader>Commands</Subheader>
            <ListItem primaryText="Ctrl-F/Cmd-F: Start searching"/>
            <ListItem primaryText="Ctrl-G/Cmd-G: Find next"/>
            <ListItem primaryText="Shift-Ctrl-G/Shift-Cmd-G: Find previous"/>
            <ListItem primaryText="Shift-Ctrl-F/Cmd-Option-F: Replace"/>
            <ListItem primaryText="Shift-Ctrl-R/Shift-Cmd-Option-F: Replace all"/>
            <ListItem
              primaryText="Alt-F: Persistent search (dialog doesn't autoclose,enter to find next, Shift-Enter to find previous)"
            />
            <ListItem primaryText="Alt-G: Jump to line"/>
          </List>
        </Dialog>
      </div>
    )
  }

  editorNoButton (actions) {
    return (
      <Dialog
        title={this.props.title}
        actions={actions}
        modal={true}
        contentStyle={style.dialog}
        open={this.props.openFromParent}
        autoScrollBodyContent={true}
      >
        <Editor
          ref='editor'
          codeText={this.state.codeText}
          onChange={this.handleCodeChange}
        />
        <List style={style.popup}>
          <Subheader>Commands</Subheader>
          <ListItem primaryText="Ctrl-F/Cmd-F: Start searching"/>
          <ListItem primaryText="Ctrl-G/Cmd-G: Find next"/>
          <ListItem primaryText="Shift-Ctrl-G/Shift-Cmd-G: Find previous"/>
          <ListItem primaryText="Shift-Ctrl-F/Cmd-Option-F: Replace"/>
          <ListItem primaryText="Shift-Ctrl-R/Shift-Cmd-Option-F: Replace all"/>
          <ListItem
            primaryText="Alt-F: Persistent search (dialog doesn't autoclose,enter to find next, Shift-Enter to find previous)"
          />
          <ListItem primaryText="Alt-G: Jump to line"/>
        </List>
      </Dialog>
    )
  }

  render () {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Save"
        primary={true}
        onTouchTap={this.saveCode}
      />,
    ]
    console.log(`Use Buttons? ${this.props.useButton}`)
    const editorElement = this.props.useButton ? this.editorWithButton(actions) : this.editorNoButton(actions)
    return (editorElement)
  }
}



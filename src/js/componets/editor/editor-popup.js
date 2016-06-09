import React, {Component} from "react";
import Dialog from "material-ui/Dialog";
import RaisedButton from "material-ui/RaisedButton";
import FlatButton from "material-ui/FlatButton";
import * as EditorActions from "../../actions/editor-actions";
import Editor from "./editor";
import EditorStore from "../../stores/editorStore";

import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'


const style = {
   dialog: {
      width: '75%',
      height: '75%',
      maxWidth: 'none',
      maxHeight: 'none',
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
      buttonLabel: React.PropTypes.string.isRequired,
      codeToLoad: React.PropTypes.string.isRequired,
   }

   constructor(props, context) {
      super(props, context)
      this.state = {open: false, codeText: EditorStore.getCode(this.props.codeToLoad)}
      this.handleOpen = this.handleOpen.bind(this)
      this.handleClose = this.handleClose.bind(this)
      this.handleCodeChange = this.handleCodeChange.bind(this)
      this.saveCode = this.saveCode.bind(this)
      this.storeUpdate = this.storeUpdate.bind(this)

   }

   storeUpdate(){
      console.log('code add')
      this.setState({codeText: EditorStore.getCode(this.props.codeToLoad)})
   }


   componentDidMount() {
      EditorStore.on('code-fetched',this.storeUpdate)
   }

   componentWillUnmount() {
      EditorStore.removeListener('code-fetched',this.storeUpdate)
   }
   
   handleOpen() {
      this.setState({open: true})
   }

   handleClose() {
      this.setState({open: false})
   }

   handleCodeChange(code) {
      this.setState({code})
   }

   saveCode() {
      this.setState({open: false})
      EditorActions.saveCode(this.props.codePath, this.state.code, error => {
         console.log('error in editor popup', error)
      })

   }

   render() {
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
}



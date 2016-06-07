import React, {Component} from "react";
import Dialog from "material-ui/Dialog";
import RaisedButton from "material-ui/RaisedButton";
import FlatButton from "material-ui/FlatButton";
import * as EditorActions from "../../actions/editor-actions";
import Editor from "./editor";
import EditorStore from "../../stores/editorStore";
const style = {
   dialog: {
      width: '50%',
      height: '50%',
      maxWidth: 'none',
      maxHeight: 'none',
   },
   button: {
      margin: 12,
   },
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
               <dl>
                  <dt>Ctrl-F / Cmd-F</dt>
                  <dd>Start searching</dd>
                  <dt>Ctrl-G / Cmd-G</dt>
                  <dd>Find next</dd>
                  <dt>Shift-Ctrl-G / Shift-Cmd-G</dt>
                  <dd>Find previous</dd>
                  <dt>Shift-Ctrl-F / Cmd-Option-F</dt>
                  <dd>Replace</dd>
                  <dt>Shift-Ctrl-R / Shift-Cmd-Option-F</dt>
                  <dd>Replace all</dd>
                  <dt>Alt-F</dt>
                  <dd>Persistent search (dialog doesn't autoclose,
                      enter to find next, Shift-Enter to find previous)
                  </dd>
                  <dt>Alt-G</dt>
                  <dd>Jump to line</dd>
               </dl>
            </Dialog>
         </div>


      )
   }
}



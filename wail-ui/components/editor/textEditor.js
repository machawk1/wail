import React, {Component, PropTypes} from 'react'
import {Editor, EditorState} from 'draft-js'

export default class TextEditor extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = { editorState: EditorState.createEmpty() }
  }

  @autobind
  focus () {
    this.refs.editor.focus()
  }

  @autobind
  onChange (editorState) {
    console.log(editorState.getCurrentContent())
    this.setState({editorState}, () => {
      this.props.onChange(editorState.toJS())
    })
  }

  @autobind
  logState () {
    console.log(this.state.editorState.toJS())
  }

  render () {
    return (
      <div onClick={this.focus}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          placeholder='Enter Description'
          ref='editor'
        />
      </div>
    )
  }
}

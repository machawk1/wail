import React, { Component } from 'react'
import CodeMirror from 'codemirror'
import style from './style.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/xml/xml'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/search'
import 'codemirror/addon/scroll/annotatescrollbar'
import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/search/matchesonscrollbar.css'
import 'codemirror/addon/search/jump-to-line'

export default class Editor extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    codeText: React.PropTypes.string,
    lineNumbers: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    readOnly: React.PropTypes.bool,
    tabSize: React.PropTypes.number,
    theme: React.PropTypes.string
  }

  static defaultProps = {
    className: '',
    lineNumbers: true,
    readOnly: false,
    tabSize: 2,
    theme: 'material',
  }

  constructor (props, context) {
    super(props, context)

    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount () {
    this.editor = CodeMirror.fromTextArea(this.refs.editor, {
      mode: 'xml',
      lineNumbers: this.props.lineNumbers,
      smartIndent: false,
      tabSize: this.props.tabSize,
      matchBrackets: true,
      theme: this.props.theme,
      readOnly: this.props.readOnly
    })

    this.editor.on('change', this.handleChange)
  }

  componentDidUpdate () {
    if (this.props.readOnly) {
      this.editor.setValue(this.props.codeText)
    }
  }

  handleChange () {
    if (!this.props.readOnly && this.props.onChange) {
      this.props.onChange(this.editor.getValue())
    }
  }

  setCode (code) {
    this.editor.getDoc().setValue(code)
    this.handleChange()
  }

  render () {
    let className = style.editor
    if (this.props.className) className += `${this.props.className}`
    return (
      <div className={className}>
        <textarea ref='editor' defaultValue={this.props.codeText} />
      </div>
    )
  }
}

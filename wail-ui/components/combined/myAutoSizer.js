import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import createDetectElementResize from '../../vendor/detectElementResize'

export default class MyAutoSizer extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    findElement: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.me = null
    this.state = {
      width: 0,
      height: 0
    }
    this._detectElementResize = null
    this.updateDimensions = this.updateDimensions.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentWillUnmount () {
    if (this._detectElementResize) {
      this._detectElementResize.removeResizeListener(document.getElementById(this.props.findElement), this.updateDimensions)
    }
  }

  updateDimensions () {
    let dnode = document.getElementById(this.props.findElement)
    this.setState({
      width: dnode.clientWidth || 0,
      height: dnode.clientHeight || 0,
    })
  }

  componentDidMount () {
    this._detectElementResize = createDetectElementResize()
    this._detectElementResize.addResizeListener(document.getElementById(this.props.findElement), this.updateDimensions)
    this.updateDimensions()
  }

  render () {
    return (
      this.props.children(this.state)
    )
  }

}
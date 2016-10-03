import React, {Component, PropTypes} from 'react'
import {CardTitle} from 'material-ui/Card'
import shallowCompare from 'react-addons-shallow-compare'
import autobind from 'autobind-decorator'
import CollectionStore from '../../../stores/collectionStore'

export default class NumArchives extends Component {
  static propTypes = {
    viewingCol: PropTypes.string.isRequired,
    numArchives: PropTypes.number.isRequired,
  }

  constructor (...args) {
    super(...args)
    this.state = {
      numArchives: this.props.numArchives
    }
  }

  componentWillMount () {
    CollectionStore.on(`updated-${this.props.viewingCol}-warcs`, this.updateArchiveCount)
  }

  componentWillUnmount () {
    CollectionStore.removeListener(`updated-${this.props.viewingCol}-warcs`, this.updateArchiveCount)
  }


  @autobind
  updateArchiveCount (numArchives) {
    this.setState({ numArchives })
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <CardTitle
        data-tip='Drag drop archives to add' data-delay-show='100'
        data-class="wailToolTip"
        subtitle={`(W)arcs in collection: ${this.state.numArchives}`}
      >
      </CardTitle>
    )
  }

}
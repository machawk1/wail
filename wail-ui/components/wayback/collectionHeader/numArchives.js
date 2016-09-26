import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import autobind from 'autobind-decorator'
import CollectionStore from '../../../stores/collectionStore'
import ReactTooltip from 'react-tooltip'
import Badge from 'material-ui/Badge'
import IconButton from 'material-ui/IconButton'
import InfoIcon from 'material-ui/svg-icons/action/info-outline'

export default class NumArchives extends Component {
  static propTypes = {
    viewingCol: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      numArchives: CollectionStore.getNumberOfArchives(this.props.viewingCol)
    }
  }

  componentWillMount () {
    CollectionStore.on(`updated-${this.props.viewingCol}-warcs`, this.updateArchiveCount)
  }

  componentWillUnmount () {
    CollectionStore.removeListener(`updated-${this.props.viewingCol}-warcs`, this.updateArchiveCount)
  }

  componentWillReceiveProps (nextProps, nextContext) {
    if (this.props.viewingCol !== nextProps.viewingCol) {
      this.swapListener(this.props.viewingCol, nextProps.viewingCol)
      this.setState({ numArchives: CollectionStore.getNumberOfArchives(nextProps.viewingCol) })
    }
  }

  @autobind
  swapListener (prevCol, nextCol) {
    CollectionStore.removeListener(`updated-${prevCol}-warcs`, this.updateArchiveCount)
    CollectionStore.on(`updated-${nextCol}-warcs`, this.updateArchiveCount)
  }

  @autobind
  updateArchiveCount (numArchives) {
    this.setState({ numArchives })
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    let shouldUpdate = shallowCompare(this, nextProps, nextState)
    console.log(this.props, nextProps, shouldUpdate)
    return shouldUpdate
  }

  render () {
    return (
      <div>
        <p
          data-tip='Drag drop archives to add'
          data-delay-show='100'
        >
          {`Archives in collection: ${this.state.numArchives}`}
        </p>
        <ReactTooltip />
      </div>
    )
  }

}
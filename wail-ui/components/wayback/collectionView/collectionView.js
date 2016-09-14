import React, {Component, PropTypes} from 'react'
import CollectionOverview from './collectionOverview'
import { Row, Col } from 'react-flexbox-grid'

export default class CollectionView extends Component {
  static propTypes = {
    collections: PropTypes.object.isRequired,
    viewWatcher: PropTypes.object.isRequired,
    from: PropTypes.string.isRequired,
    defaultView: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    let { collections, defaultView } = this.props
    console.log(this.props)
    this.state = {
      viewing: collections[ defaultView ]
    }
  }

  componentWillMount () {
    let { viewWatcher, from, collections } = this.props
    viewWatcher.on(`${from}-view`, viewMe => {
      this.setState({ viewing: collections[ viewMe ] })
    })
  }

  componentWillUnmount () {
    let { viewWatcher, from } = this.props
    viewWatcher.removeListener(`${from}-view`)
  }

  render () {
    let { viewing } = this.state
    return (
      <Row style={{height: '72vh'}}>
        <Col xs>
          <CollectionOverview collection={viewing} />
        </Col>
      </Row>
    )
  }
}

import React, {Component, PropTypes} from 'react'
import EditButton from 'material-ui/FloatingActionButton'
import EditIcon from 'material-ui/svg-icons/image/edit'
import {cyan700 as color} from 'material-ui/styles/colors'
import {Grid, Row, Col} from 'react-flexbox-grid'
import autobind from 'autobind-decorator'

export default class CollectionHeader extends Component {
  static propTypes = {
    viewWatcher: PropTypes.object.isRequired,
    from: PropTypes.string.isRequired,
  }

  constructor (...args) {
    super(...args)
    this.state = {
      collectionTitle: ''
    }

  }

  componentWillReceiveProps (nextProps, nextContext) {
    console.log('will recive props', nextProps, nextContext)
    if (Reflect.has(nextProps, 'collectionTitle')) {
      let { collectionTitle } = nextProps
      this.setState({ collectionTitle })
    }
  }

  componentWillMount () {
    let { viewWatcher, from } = this.props
    viewWatcher.on(`${from}-view`, collectionTitle => {
      this.setState({ collectionTitle })
    })
  }

  componentWillUnmount () {
    let { viewWatcher, from } = this.props
    viewWatcher.removeListener(`${from}-view`)
  }

  render () {

    return (
      <Grid style={{ backgroundColor: color, zIndex: 1 }} fluid>
        <Row center="xs">
          <Col>
            <h1>Collections</h1>
          </Col>
          <Col>
            <h1>{this.state.collectionTitle}</h1>
          </Col>
        </Row>
      </Grid>
    )
  }
}

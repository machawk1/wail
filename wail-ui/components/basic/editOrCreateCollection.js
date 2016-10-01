import React, {Component, PropTypes} from 'react'
import {Grid, Row, Col} from 'react-flexbox-grid'
import CollectionStore from '../../stores/collectionStore'
import {Card, CardHeader} from 'material-ui/Card'
import BasicColList from './basicCollectionList'
import ViewWatcher from '../../../wail-core/util/viewWatcher'

const from = 'editOrCreateCollection'

export default class EditOrCreateCollection extends Component {

  constructor (...args) {
    super(...args)
    console.log(CollectionStore)
    let maybeNames = CollectionStore.getColNames()
    console.log(maybeNames)
    this.state = {
      colNames: maybeNames.length > 0 ? maybeNames : [ 'Wail' ],
      viewing: 'Wail',
      expanded: false
    }
  }

  componentWillMount () {
    CollectionStore.on('got-all-collections', ::this.gotAllNames)
    ViewWatcher.on(`${from}-view`, viewMe => {
      this.setState({ viewing: viewMe })
    })
  }

  componentWillUnmount () {
    CollectionStore.removeListener('got-all-collections', ::this.gotAllNames)
    ViewWatcher.removeListener(`${from}-view`)
  }

  gotAllNames (cols) {
    console.log('got allNames archive or checkCol', cols)
    this.setState({
      colNames: cols.map(c => c.colName)
    })
  }

  handleExpand = () => {
    this.setState({expanded: true})
  }

  handleReduce = () => {
    this.setState({expanded: false})
  }

  handleExpandChange = (expanded) => {
    this.setState({expanded: expanded})
  }

  render () {
    return (
      <Card style={{width: '100%'}}
      >
        <CardHeader
          title='Collections'
          subtitle='Edit Or Create A Collection'
          showExpandableButton
        />
        <Grid fluid>
          <Row>
            <Col xs>
              <BasicColList
                cols={this.state.colNames}
                viewWatcher={ViewWatcher}
                from={from}
              />
            </Col>
            <Col xs>
             <p>alskjdlsak</p>
            </Col>
          </Row>
        </Grid>
      </Card>
    )
  }

}

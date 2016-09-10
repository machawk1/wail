import React, { Component, PropTypes } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import CollectionStore from '../../stores/collectionStore'
import ArchivalButtons from './archivalButtos'
import ArchiveUrl from './archive-url'
import BasicColList from './basicCollectionList'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import autobind from 'autobind-decorator'

const from = 'archiveOrCheckCols'

let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

export default class ArchiveOrCheckCol extends Component {



  constructor (...args) {
    super(...args)
    console.log(CollectionStore)
    let maybeNames = CollectionStore.getColNames()
    console.log(maybeNames)
    this.state = {
      colNames: maybeNames.length > 0 ? maybeNames : [ 'Wail' ],
      viewing: defForCol
    }
  }

  componentWillMount () {
    CollectionStore.on('got-all-collections', this.gotAllNames)
    CollectionStore.on('added-new-collection', this.gotAllNames)
    ViewWatcher.on(`${from}-view`, viewMe => {
      this.setState({ viewing: viewMe })
    })
  }

  componentWillUnmount () {
    console.log('componet willl un mount archive or check col')
    CollectionStore.removeListener('got-all-collections', this.gotAllNames)
    CollectionStore.removeListener('added-new-collection', this.gotAllNames)
    ViewWatcher.removeListener(`${from}-view`)
  }

  @autobind
  gotAllNames (cols) {
    console.log('got allNames archive or checkCol',cols)
    this.setState({
      colNames: cols.map(c => c.colName)
    })
  }

  render () {
    return (

        <div>
          <Row>
            <Col xs>
              <ArchiveUrl forCol={this.state.viewing}/>
            </Col>
          </Row>
          <Row>
            <Col xs>
              <ArchivalButtons
              archiveList={
                <BasicColList
                  cols={this.state.colNames}
                  viewWatcher={ViewWatcher}
                  from={from}
                />
              }
              forCol={this.state.viewing}
              />
            </Col>
          </Row>
        </div>
    )
  }

}
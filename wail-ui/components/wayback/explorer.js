import React, { Component, PropTypes } from 'react'
import { ipcRenderer as ipc } from 'electron'
import { Grid, Row, Col } from 'react-flexbox-grid'
import _ from 'lodash'
import CircularProgress from 'material-ui/CircularProgress'
import CollectionView from './collectionView'
import CollectionList from './collectionList'
import CollectionHeader from './collectionHeader'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import Dimensions from 'react-dimensions'
import ColStore from '../../stores/collectionStore'
import '../../css/wail.css'

@Dimensions()
export default class Explorer extends Component {
  constructor (props, context) {
    super(props, context)
    let colNames = []
    let collections = {}
    let entries = ColStore.collections
    console.log(entries)
    for (let [cname, collection] of ColStore.collections) {
      colNames.push(cname)
      collections[ cname ] = collection
    }
    this.state = {
      loading: true,
      collections,
      colNames
    }
  }

  componentWillMount () {
    ColStore.on('got-all-collections', ::this.getCollections)
  }

  componentWillUnmount () {
    ColStore.removeListener('got-all-collections', ::this.getCollections)
  }

  getCollections (cols) {
    let { collections, colNames } = this.state
    console.log(cols)
    cols.forEach(col => {
      colNames.push(col.colName)
      collections[ col.colName ] = col
    })
    this.setState({ collections, colNames })
  }

  render () {
    return (
      <div>
        <CollectionList
          key='the-list'
          cols={this.state.colNames}
          viewWatcher={ViewWatcher}
          from='Wail-Archive-Collections'
        />
        <Row>
          <Col xs>
            <CollectionView
              collections={this.state.collections}
              viewWatcher={ViewWatcher}
              from='Wail-Archive-Collections'
              defaultView='Wail'
            />
          </Col>
        </Row>
      </div>

    )
  }
}
/*
 <div>
 <CollectionList key="the-list" cols={this.state.colNames} clicked={this.clicked}/>
 <CollectionView collection={this.state.collections[ this.state.showing ]}/>
 </div>
 */

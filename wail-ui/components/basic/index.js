import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Container from 'muicss/lib/react/container'
import FlatButton from 'material-ui/FlatButton'
import autobind from 'autobind-decorator'
import {Flex, Item} from 'react-flex'
import {shell, remote} from 'electron'
import _ from 'lodash'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import {withRouter} from 'react-router'
import SortIcon from 'material-ui/svg-icons/action/swap-vert'
import * as colors from 'material-ui/styles/colors'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
import {ArchivalButtons, ArchiveUrl} from './archive'
import Divider from 'muicss/lib/react/divider'
import BasicCollectionList from './localCollections'
import SortDown from 'material-ui/svg-icons/navigation/arrow-drop-down'
import SortUp from 'material-ui/svg-icons/navigation/arrow-drop-up'
import {
  Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
}
  from 'material-ui/Table'
import CollectionStore from '../../stores/collectionStore'
import ViewWatcher from '../../../wail-core/util/viewWatcher'

const fuzzyFilter = (searchText, key) => {
  const compareString = key.toLowerCase()
  searchText = searchText.toLowerCase()

  let searchTextIndex = 0
  for (let index = 0; index < key.length; index++) {
    if (compareString[ index ] === searchText[ searchTextIndex ]) {
      searchTextIndex += 1
    }
  }

  return searchTextIndex === searchText.length
}

@withRouter
export default class BasicTab extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: '',
      collections: CollectionStore.getCols()
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidMount () {
    CollectionStore.on('added-new-collection', ::this.updateColNames)
    CollectionStore.on('got-all-collections', ::this.loadCols)
  }

  componentWillUnmount () {
    CollectionStore.removeListener('added-new-collection', ::this.updateColNames)
    CollectionStore.removeListener('got-all-collections', ::this.loadCols)
  }

  loadCols (collections) {
    this.setState({ collections })
  }

  @autobind
  updateColNames () {
    this.setState({ collections: CollectionStore.getCols() })
  }

  @autobind
  handleChange (event) {
    const searchText = event.target.value
    if (searchText === this.state.searchText) {
      return
    }

    this.setState({
      searchText: searchText
    })
  }

  doSort () {
    console.log('doing sort', _.sortBy(this.state.collections, ['name']))
    this.setState({collections: _.sortBy(this.state.collections, [o => o.name.toLowerCase()])})
  }

  render () {
    console.log('rendering')
    return (
      <div style={{ width: '100%', height: '100%', flex: 1 }}>
        <Flex row alignItems='center' justifyContent='space-between'>
          <CardTitle
            title='Collections'
          />
          <FlatButton primary label='New Collection' onTouchTap={() => ViewWatcher.createCollection()} />
        </Flex>
        <div style={{ width: 'inherit', height: 'inherit' }}>
          <AutoSizer>
            {({ height, width }) => (
              <Table
                height={`${height - 100}px`}
                bodyStyle={{ width }}
                style={{ width }}
                wrapperStyle={{ width }}
              >
                <TableHeader
                  displaySelectAll={false}
                  adjustForCheckbox={false}
                >
                  <TableRow >
                    <TableHeaderColumn
                    >
                      name
                    </TableHeaderColumn>
                    <TableHeaderColumn>
                      seeds
                    </TableHeaderColumn>
                    <TableHeaderColumn>
                      last updated
                    </TableHeaderColumn>
                    <TableHeaderColumn >
                      size
                    </TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody
                  displayRowCheckbox={false}
                  showRowHover
                >
                  {this.state.collections.map((col, i) =>
                    <TableRow key={`${i}-${col.name}`}>
                      <TableRowColumn>
                        {col.name}
                      </TableRowColumn>
                      <TableRowColumn />
                      <TableRowColumn />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </AutoSizer>
        </div>
      </div>
    )
  }
}

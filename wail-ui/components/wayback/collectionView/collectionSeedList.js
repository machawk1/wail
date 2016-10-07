import React, { Component, PropTypes } from 'react'
import autobind from 'autobind-decorator'
import { shell, remote } from 'electron'
import CollectionStore from '../../../stores/collectionStore'
import CrawlStore from '../../../stores/crawlStore'
import _ from 'lodash'
import Divider from 'material-ui/Divider'
import S from 'string'
import Filter from 'material-ui/svg-icons/content/filter-list'
import IconButton from 'material-ui/IconButton'
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser'
import FlatButton from 'material-ui/FlatButton'
import * as colors from 'material-ui/styles/colors'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { AutoSizer } from 'react-virtualized'
import { decorate } from 'core-decorators'
import { memoize } from 'lodash'
import { Textfit } from 'react-textfit'
import { Card, CardActions } from 'material-ui/Card'
import Container from 'muicss/lib/react/container'
import TextField from 'material-ui/TextField'
import shallowCompare from 'react-addons-shallow-compare'
import ListItem from 'material-ui/List/ListItem'

const fuzzyFilter = (searchText, key) => {
  const compareString = key.toLowerCase()
  searchText = searchText.toLowerCase()

  let searchTextIndex = 0;
  for (let index = 0; index < key.length; index++) {
    if (compareString[ index ] === searchText[ searchTextIndex ]) {
      searchTextIndex += 1
    }
  }

  return searchTextIndex === searchText.length
}

const wbUrl = remote.getGlobal('settings').get('pywb.url')
const openInWb = (seed, forCol) => shell.openExternal(`${wbUrl}${forCol}/*/${seed}`)

export default class CollectionSeedList extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    viewingCol: PropTypes.string.isRequired,
  }

  constructor (...args) {
    super(...args)
    let sl = CollectionStore.getUniqueSeeds(this.context.viewingCol)
    this.seedCrawls = CollectionStore.getCrawlInfoForCol(this.context.viewingCol)

    this.state = {
      searchText: '',
      seeds: _.clone(sl),
      viewingSeeds: _.clone(sl)
    }
  }

  // shouldComponentUpdate (nextProps, nextState, nextContext) {
  //   console.log('colSeedList should component update')
  //   return shallowCompare(this, nextProps, nextState)
  // }

  componentWillMount () {
    CrawlStore.on('jobs-updated', this.checkShouldUpdate)
  }

  componentWillUnmount () {
    CrawlStore.removeListener('jobs-updated', this.checkShouldUpdate)
  }

  @autobind
  checkShouldUpdate () {
    let sl = CollectionStore.getUniqueSeeds(this.context.viewingCol)
    let seedCrawls = CrawlStore.getCrawlInfoForCol(this.context.viewingCol)
    if (!_.isEqual(this.seeds, sl) || !_.isEqual(this.seedCrawls, seedCrawls)) {
      this.seedCrawls = seedCrawls
      this.setState({
        seeds: sl.slice(0),
      })
    }
  }

  @autobind
  handleChange (event) {
    const searchText = event.target.value
    if (searchText === this.state.searchText) {
      return
    }

    this.setState({
      searchText: searchText,
      viewingSeeds: this.getViewingSeeds(searchText)
    })
  }

  @autobind
  renderSeed (seed, i) {
    console.log(seed)
    let { viewingCol } = this.context
    console.log(this.seedCrawls.get(seed))
    return (
      <TableRow key={`${seed}${i}-TableRow`}>
        <TableRowColumn key={`${seed}${i}-TRCol-seed`}>
          {seed}
        </TableRowColumn>
        <TableRowColumn key={`${seed}${i}-TRCol-lcrawl`}>
          {this.seedCrawls.get(seed).created.format('MMM DD YYYY h:mm:ssa')}
        </TableRowColumn>
        <TableRowColumn key={`${seed}${i}-TRCol-wb`}>
          <IconButton onTouchTap={() => openInWb(seed, viewingCol)} style={{ paddingLeft: '50px' }}>
            <OpenInBrowser />
          </IconButton>
        </TableRowColumn>
      </TableRow>
    )
  }

  @decorate(memoize)
  getViewingSeeds (searchText) {
    let { seeds } = this.state
    return seeds.filter(seed => fuzzyFilter(searchText, seed))
  }

  buildList (searchText) {
    return this.getViewingSeeds(searchText)
      .map(this.renderSeed)
  }

  render () {
    console.log('collSeedList')
    // window.lastWaybackPath = this.props.params.col
    return (
      <div style={{ width: '100%', height: '100%', }}>
        <Container>
          <div className="seedListWB">
            <Table
              headerStyle={{ paddingTop: '10px' }}
            >
              <TableHeader
                displaySelectAll={false}
                adjustForCheckbox={false}
              >
                <TableRow>
                  <TableHeaderColumn colSpan="3">
                    <TextField
                      style={{ paddingLeft: '10px', width: '90%' }}
                      id='collectionSearch'
                      hintText='http://ws-dl.cs.odu.edu'
                      floatingLabelText='Filter'
                      value={this.state.searchText}
                      onChange={this.handleChange}
                    />
                  </TableHeaderColumn>
                </TableRow>
                <TableRow
                  style={{
                    marginTop: '10px'
                  }}
                >
                  <TableHeaderColumn
                    style={{
                      paddingLeft: '50px',
                      color: colors.darkBlack
                    }}
                  >
                    Seed URL
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    style={{
                      paddingLeft: '50px',
                      color: colors.darkBlack
                    }}
                  >
                    Added
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    style={{
                      paddingLeft: '60px',
                      color: colors.darkBlack
                    }}
                  >
                    Wayback
                  </TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                preScanRows={false}
                displayRowCheckbox={false}
                showRowHover={false}
              >
                { this.state.viewingSeeds.map((seed, i) => this.renderSeed(seed, i))}
              </TableBody>
            </Table>
          </div>
        </Container>
      </div>
    )
  }
}

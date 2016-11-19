import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import Immutable from 'immutable'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import {Flex} from 'react-flex'
import MyAutoSizer from '../utilComponents/myAutoSizer'
import Search from 'material-ui/svg-icons/action/search'
import {Card, CardTitle, CardText} from 'material-ui/Card'
import SortDirection from '../sortDirection/sortDirection'
import SortHeader from '../sortDirection/sortHeader'
import Divider from 'material-ui/Divider'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui/Table'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import fuzzyFilter from '../../util/fuzzyFilter'



@connect(state => ({
  collections: state.get('collections')
}))
export default class Combined extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }
  static propTypes = {
    collections: PropTypes.instanceOf(Immutable.Map).isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: '',
      sortDirection: SortDirection.ASC,
      sortKey: ''
    }
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

  componentDidUpdate (prevProps, prevState, prevContext) {
    console.log('Combined component did update')
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  renTr () {
    let trs = []
    let cols
    if (this.state.sortDirection) {
      cols = this.props.collections.toList()
        .filter(aCol => fuzzyFilter(this.state.searchText, aCol.get('colName')))
        .sortBy(aCol => aCol.get('colName').toLowerCase())
        .update(list => this.state.sortDirection === SortDirection.DESC ? list.reverse() : list)
    } else {
      cols = this.props.collections.toList().filter(aCol => fuzzyFilter(this.state.searchText, aCol.get('colName')))
    }
    let len = cols.size
    let { primary1Color } = this.context.muiTheme.baseTheme.palette
    for (let i = 0; i < len; ++i) {
      let col = cols.get(i)
      let cname = col.get('colName')
      trs.push(<TableRow key={`${i}-${cname}`}>
        <TableRowColumn key={`${i}-${cname}-name`}>
          <Link to={`Collections/${cname}`} style={{ color: primary1Color, textDecoration: 'none' }}>{cname}</Link>
        </TableRowColumn>
        <TableRowColumn key={`${i}-${cname}-numSeeds`}>
          {col.get('seeds').size}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${cname}-lastUpdated`}>
          {col.get('lastUpdated').format('MMM DD YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${cname}-size`}>
          {col.get('size')}
        </TableRowColumn>
      </TableRow>)
    }

    return trs
  }

  render () {
    let trs = this.renTr()
    return (
      <div style={{ width: '100%', height: '100%' }} id='cViewContainer'>
        <Flex row alignItems='center' justifyContent='space-between'>
          <CardTitle
            title='Collections'
          />
          <FlatButton primary label='New Collection' onTouchTap={() => ViewWatcher.createCollection()}/>
        </Flex>
        <Card>
          <CardText
            style={{ padding: 0, paddingLeft: 64 }}>
            <span>
              <TextField
                style={{ width: '90%', paddingLeft: '10px' }}
                id='collectionSearch'
                hintText='Search'
                value={this.state.searchText}
                onChange={this.handleChange}
              />
            </span>
            <span>
              <Search />
            </span>
          </CardText>
        </Card>
        <Divider />
        <div style={{ height: 'inherit' }}>
          <MyAutoSizer findElement='cViewContainer'>
            {({ height }) => {
              return (
                <Table
                  height={`${height - 130}px`}
                >
                  <TableHeader
                    displaySelectAll={false}
                    adjustForCheckbox={false}
                  >
                    <TableRow >
                      <SortHeader key='SortHeader-name' text='Name' sortDirection={this.state.sortDirection}
                                  onTouchTap={(sortKey, sortDirection) => {
                                    this.setState({
                                      sortDirection,
                                      sortKey
                                    })
                                  }}/>
                      <TableHeaderColumn>
                        Seeds
                      </TableHeaderColumn>
                      <TableHeaderColumn>
                        Last Updated
                      </TableHeaderColumn>
                      <TableHeaderColumn >
                        Size
                      </TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody
                    displayRowCheckbox={false}
                    showRowHover
                  >
                    {trs}
                  </TableBody>
                </Table>
              )
            }}
          </MyAutoSizer>
        </div>
      </div>
    )
  }

}

/*
 ({ children, location, params, route }) => {
 console.log(location, children)

 }
 */

/*
 <Card>
 <SelectionCollection />
 <CardText>
 <span>
 <TextField
 style={{ width: '90%', paddingLeft: '10px' }}
 id='collectionSearch'
 hintText='Search'
 value={this.state.searchText}
 onChange={this.handleChange}
 />
 </span>
 <span>
 <Search />
 </span>
 </CardText>
 <Divider />
 <Table>
 <TableHeader
 displaySelectAll={false}
 adjustForCheckbox={false}
 >
 <TableRow >
 <SortHeader key='SortHeader-name' text='Name' sortDirection={sdirection}
 onTouchTap={(sortKey, sortDirection) => { this.setState({ sortDirection, sortKey })}}/>
 <TableHeaderColumn>
 Seeds
 </TableHeaderColumn>
 <TableHeaderColumn>
 Last Updated
 </TableHeaderColumn>
 <TableHeaderColumn >
 Size
 </TableHeaderColumn>
 </TableRow>
 </TableHeader>
 </Table>
 </Card>
 <div style={{ overflow: 'auto' }}>
 <Table>
 <TableBody
 displayRowCheckbox={false}
 showRowHover
 >
 {this.renTr()}
 </TableBody>
 </Table>
 </div>
 */

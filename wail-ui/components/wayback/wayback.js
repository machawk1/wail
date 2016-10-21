import React, { Component, PropTypes } from 'react'
import autobind from 'autobind-decorator'
import { Flex, Item } from 'react-flex'
import { shell, remote } from 'electron'
import { withRouter } from 'react-router'
import S from 'string'
import PageView from 'material-ui/svg-icons/action/pageview'
import FlatButton from 'material-ui/FlatButton'
import { decorate } from 'core-decorators'
import { memoize } from 'lodash'
import { TransitionMotion, spring, presets } from 'react-motion'
import { Card, CardHeader, CardTitle, CardText } from 'material-ui/Card'
import Search from 'material-ui/svg-icons/action/search'
import Container from 'muicss/lib/react/container'
import TextField from 'material-ui/TextField'
import CollectionStore from '../../stores/collectionStore'
import wailConstants from '../../constants/wail-constants'
import List from 'material-ui/List/List'
import ListItem from 'material-ui/List/ListItem'
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
export default class WayBackTab extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.removeWarcAdder = null
    let { colNames } = CollectionStore
    this.state = {
      searchText: '',
      colNames: colNames
    }
  }

  componentDidMount () {
    CollectionStore.on('added-new-collection', this.updateColNames)
  }

  componentWillUnmount () {
    CollectionStore.removeListener('added-new-collection', this.updateColNames)
  }

  @autobind
  updateColNames () {
    this.setState({ colNames: CollectionStore.colNames })
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

  @decorate(memoize)
  getListItems (searchText) {
    console.log('wb get styles', searchText)
    let { colNames } = this.state
    return colNames.filter(cName => fuzzyFilter(searchText, cName))
      .map((colName, i) => <ListItem
        rightIcon={<PageView />}
        innerDivStyle={{ padding: 0 }}
        onTouchTap={() => this.props.router.push(`wayback/${colName}`)}
        primaryText={
          <Card
            key={`card-${colName}${i}`}
          >
            <CardHeader
              key={`cardheader-${colName}${i}`}
              title={colName}
            />
          </Card>
        }
        key={`li-${colName}${i}`}
      />)
  }

  render () {
    return (
      <div style={{ width: '100%', height: 'calc(100% - 60px)', overflowX: 'hidden', overflowY: 'scroll' }}>
        <Container>
          <div className='waybackCLMiddle'>
            <Flex row alignItems='center' justifyContent='space-between'>
              <CardTitle
                title='Collections'
              />
              <FlatButton primary label='New Collection' onTouchTap={() => ViewWatcher.createCollection()} />
            </Flex>
            <Card style={{ height: '75px' }}>
              <CardText>
                <span>
                   <Search />
                </span>
                <span>
                 <TextField
                   style={{ width: '90%', paddingLeft: '10px' }}
                   id='collectionSearch'
                   hintText='Search'
                   value={this.state.searchText}
                   onChange={this.handleChange}
                 />
              </span>
              </CardText>
            </Card>
            <List >
              {this.getListItems(this.state.searchText)}
            </List>
          </div>
        </Container>
      </div>
    )
  }
}

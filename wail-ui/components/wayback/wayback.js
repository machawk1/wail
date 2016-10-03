import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {Flex,Item} from 'react-flex'
import {shell, remote} from 'electron'
import {withRouter} from 'react-router'
import S from 'string'
import PageView from 'material-ui/svg-icons/action/pageview'
import FlatButton from 'material-ui/FlatButton'
import {decorate} from 'core-decorators'
import {memoize} from 'lodash'
import {TransitionMotion, spring, presets} from 'react-motion'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
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

  let searchTextIndex = 0;
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
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (...args) {
    super(...args)
    this.removeWarcAdder = null
    let { colNames } = CollectionStore
    this.state = {
      searchText: '',
      colNames: colNames.concat(colNames).concat(colNames).concat(colNames).concat(colNames)
    }
  }

  componentDidMount () {
    CollectionStore.on('added-new-collection', this.updateColNames)
  }

  componentWillUnmount () {
    CollectionStore.removeListener('added-new-collection', this.updateColNames)
    // this.removeWarcAdder()
    // this.removeWarcAdder = null
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
  getDefaultStyles () {
    console.log('wb get default styles')
    return this.state.colNames.map((colName, i) => {
      return {
        key: `${i}${colName}`,
        data: { colName },
        style: { height: 0, opacity: 1 }
      }
    })
  }

  @decorate(memoize)
  getStyles (searchText) {
    console.log('wb get styles', searchText)
    let { colNames } = this.state
    return colNames.filter(cName => fuzzyFilter(searchText, cName))
      .map((colName, i) => {
        return {
          key: `${i}${colName}`,
          data: { colName },
          style: {
            height: spring(60, presets.gentle),
            opacity: spring(1, presets.gentle),
          }
        }
      })
  }

  willEnter () {
    return {
      height: 0,
      opacity: 1,
    }
  }

  willLeave () {
    return {
      height: spring(0),
      opacity: spring(0),
    }
  }

  @autobind
  renderLi (colName, i) {
    return (
      <Card
        key={`card-${colName}${i}`}
      >
        <CardHeader
          key={`cardheader-${colName}${i}`}
          textStyle={{textAlign: 'center'}}
          title={colName}
        />
      </Card>
    )
  }

  buildList (styles) {
    return styles.map(({ key, style, data: { colName } }, i) => {
      return <div key={key} style={style}>
        <ListItem
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
        />
      </div>
    })
  }

  render () {
    let { searchText } = this.state
    return (
      <div style={{ width: '100%', height: 'calc(100% - 60px)', overflowX: 'hidden', overflowY: 'scroll' }}>
        <Container>
          <div className="waybackCLMiddle">
            <Flex row alignItems='center' justifyContent='space-between'>
              <CardTitle
                title='Collections'
              />
              <FlatButton primary label='New Collection' onTouchTap={() => ViewWatcher.createCollection()}/>
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
            <TransitionMotion
              defaultStyles={this.getDefaultStyles()}
              styles={this.getStyles(searchText)}
              willLeave={this.willLeave}
              willEnter={this.willEnter}
            >
              { styles =>
                <List >
                  {this.buildList(styles)}
                </List>
              }
            </TransitionMotion>
          </div>
        </Container>
      </div>
    )
  }
}

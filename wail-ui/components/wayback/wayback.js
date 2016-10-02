import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {shell, remote} from 'electron'
import {withRouter} from 'react-router'
import S from 'string'
import {TransitionMotion, spring, presets} from 'react-motion'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
import Container from 'muicss/lib/react/container'
import TextField from 'material-ui/TextField'
import Panel from 'muicss/lib/react/panel'
import BeamMeUpScotty from 'drag-drop'
import {ipcRenderer as ipc} from 'electron'
import path from 'path'
import {joinStrings} from 'joinable'
import CollectionStore from '../../stores/collectionStore'
import wailConstants from '../../constants/wail-constants'
import List from 'material-ui/List/List'
import ListItem from 'material-ui/List/ListItem'
import CollectionList from './collectionList'
import CollectionCard from './collectionHeader/collectionCard'
import {AutoSizer} from 'react-virtualized'
import {CollectionView, CollectionToolBar, CollectionSearch} from './collectionView'

import * as notify from '../../actions/notification-actions'

const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')

const levenshteinDistance = (searchText, key) => {
  const current = [];
  let prev;
  let value;
  for (let i = 0; i <= key.length; i++) {
    for (let j = 0; j <= searchText.length; j++) {
      if (i && j) {
        if (searchText.charAt(j - 1) === key.charAt(i - 1)) value = prev
        else value = Math.min(current[ j ], current[ j - 1 ], prev) + 1
      } else {
        value = i + j
      }
      prev = current[ j ]
      current[ j ] = value
    }
  }
  return current.pop()
}

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

// if (!this.removeWarcAdder) {
//   console.log('attaching warc adder on live dom')
//   this.removeWarcAdder = BeamMeUpScotty('#warcUpload', (files) => {
//     console.log(`adding warcs maybe to col ${this.props.params.col}`, files)
//     let addMe = []
//     let badFiles = new Set()
//
//     files.forEach(f => {
//       console.log(f)
//       let ext = path.extname(f.path)
//       if (ext === '.warc' || ext === '.arc') {
//         addMe.push(f.path)
//       } else {
//         badFiles.add(ext)
//       }
//     })
//
//     if (badFiles.size > 0) {
//       notify.notifyWarning(`Unable to add files with extensions of ${joinStrings(...badFiles, { separator: ',' })}`)
//     }
//
//     if (addMe.length > 0) {
//       notify.notifyInfo(`Adding ${addMe.length} ${path.extname(addMe[ 0 ])} Files`, true)
//       ipc.send('add-warcs-to-col', {
//         forCol: this.props.params.col,
//         warcs: joinStrings(...addMe, { separator: ' ' })
//       })
//     }
//   })
// } else {
//   console.log('we mounted but already have the warc upload listener attached')
// }

@withRouter
export default class WayBackTab extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (...args) {
    super(...args)
    this.removeWarcAdder = null
    let {colNames} = CollectionStore
    this.state = {
      searchText: '',
      colNames: colNames.concat(colNames).concat(colNames)
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

  // shouldComponentUpdate (nextProps, nextState, nextContext) {
  //   return this.props.params.col !== nextProps.params.col
  // }

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

  @autobind
  renderLi (colName, i) {
    return (
      <Card
        key={`card-${colName}${i}`}
      >
        <CardHeader
          key={`cardheader-${colName}${i}`}
          title={colName}
        />
      </Card>
    )
  }

  @autobind
  renderList () {
    let renderMe = []
    let len = CollectionStore.colNames.length
    for (let i = 0; i < 5; ++i) {
      for (let j = 0; j < len; ++j) {
        let n = CollectionStore.colNames[ j ]
        if (fuzzyFilter(this.state.searchText, n)) {
          renderMe.push(<ListItem
            innerDivStyle={{ padding: 1 }}
            primaryText={this.renderLi(n, i, j)}
            key={`${n}${j}${i}-li`}
          />)
        }

      }
    }
    return renderMe
  }

  getDefaultStyles () {
    return this.state.colNames.map((colName,i) => {
      return {
        key: `${i}${colName}`,
        data: { colName },
        style: { height: 0, opacity: 1 }
      }
    })
  }

  getStyles () {
    let { colNames, searchText } = this.state
    return colNames.filter(cName => fuzzyFilter(searchText, cName))
      .map((colName,i) => {
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

  buildList (styles) {
    return styles.map(({ key, style, data: { colName } }, i) => {
      return <div key={key} style={style}>
        <ListItem
          innerDivStyle={{ padding: 0 }}
          onTouchTap={() => this.props.router.push(`wayback/${colName}`)}
          primaryText={this.renderLi(colName, i)}
          key={`li-${colName}${i}`}
        />
      </div>
    })
  }

  render () {
    // window.lastWaybackPath = this.props.params.col
    return (
      <div style={{ width: '100%', height: 'calc(100% - 60px)', overflowX: 'hidden', overflowY: 'scroll' }}>
        <Container>
          <div className="waybackCLMiddle">
            <Card>
              <CardText>
                <CardTitle
                  title='Collections'
                />
                <TextField
                  id='collectionSearch'
                  value={this.state.searchText}
                  onChange={this.handleChange}
                />
              </CardText>
            </Card>
            <TransitionMotion
              defaultStyles={this.getDefaultStyles()}
              styles={this.getStyles()}
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
/*
 <div id='warcUpload' className="wbCollectionOverviewRow"
 style={{backgroundColor: '#f2f2f2'}}
 >
 <CollectionCard viewingCol={this.props.params.col}/>
 <AutoSizer>
 {({ height, width }) => (
 <div>
 <div style={{ width, height }}>
 <CollectionView height={height} viewingCol={this.props.params.col}/>
 <CollectionToolBar
 viewingCol={this.props.params.col}
 />
 </div>
 </div>
 )}
 </AutoSizer>
 </div>
 */

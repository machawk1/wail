import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {shell, remote} from 'electron'
import {withRouter} from 'react-router'
import S from 'string'
import { decorate } from 'core-decorators'
import { memoize } from 'lodash'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
import Container from 'muicss/lib/react/container'
import TextField from 'material-ui/TextField'
import List from 'material-ui/List/List'
import ListItem from 'material-ui/List/ListItem'

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

export default class CollectionSeedList extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    viewingColRuns: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  constructor (...args) {
    super(...args)
    this.removeWarcAdder = null
    this.state = {
      searchText: '',
      seeds: ''
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

  @decorate(memoize)
  getDefaultStyles () {
    console.log('wb get default styles')
    return this.state.colNames.map((colName,i) => {
      return {
        key: `${i}${colName}`,
        data: { colName },
        style: { height: 0, opacity: 1 }
      }
    })
  }

  @decorate(memoize)
  getStyles (searchText) {
    console.log('wb get styles',searchText)
    let { colNames} = this.state
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
    let { searchText } = this.state
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
            <List >
              {this.buildList(styles)}
            </List>
          </div>
        </Container>
      </div>
    )
  }
}

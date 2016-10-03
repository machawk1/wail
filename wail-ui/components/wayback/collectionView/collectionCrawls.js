import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import CrawlStore from '../../../stores/crawlStore'
import S from 'string'
import shallowCompare from 'react-addons-shallow-compare'
import {remote, ipcRenderer as ipc} from 'electron'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
import {joinStrings} from 'joinable'
import Card from 'material-ui/Card/Card'
import CardMedia from 'material-ui/Card/CardMedia'
import CardTitle from 'material-ui/Card/CardTitle'
// From https://github.com/oliviertassinari/react-swipeable-views


S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const startNewCrawl = () => ipc.send('open-newCrawl-window', CollectionStore.colNames)

export default class CollectionCrawls extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  static propTypes = {
    viewingCol: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  renderCrawls () {
    let crawls = CrawlStore.getCrawlsForCol(this.props.viewingCol)
    if (crawls.length === 0) {
      return <ListItem primaryText={'No Crawls For This Collection Start One?'} onTouchTap={startNewCrawl}/>
    } else {
      let renderMe = []
      let len = crawls.length
      for (let i = 0; i < len; ++i) {
        let aCrawl = crawls[ i ]
        console.log(aCrawl)
        if (Array.isArray(aCrawl.urls)) {
          let seeds = joinStrings(...aCrawl.urls, { separator: '\n' })
          let elem =
            <span key={`spane-${seeds}${this.props.viewingCol}${i}`} data-tip={seeds} data-class="wailToolTip">
              <ListItem key={`li-colCrawls-${seeds}${this.props.viewingCol}${i}`} primaryText={aCrawl.urls[ 0 ]}
                        secondaryText={`Multi Seed: ${aCrawl.urls.length}`}/>
            </span>
          renderMe.push(elem)
        } else {
          renderMe.push(<ListItem key={`li-colCrawls-${aCrawl.urls}${this.props.viewingCol}${i}`}
                                  primaryText={aCrawl.urls}/>)
        }

        if (i + 1 < len) {
          renderMe.push(<Divider key={`liDividerFor-${this.props.viewingCol}${i}`}/>)
        }
      }
      return renderMe
    }
  }

  render () {
    return (
      <Card>
        <CardTitle
          subtitle={'Seed List'}
        />
        <CardMedia>
          <List
            style={{
              maxHeight: `${this.props.height -300}px`,
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {this.renderCrawls()}
            <ListItem primaryText={'end'}/>
          </List>
        </CardMedia>
      </Card>
    )
  }

}




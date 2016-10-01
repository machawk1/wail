import React, {Component, PropTypes} from 'react'
import {Card, CardHeader, CardMedia} from 'material-ui/Card'
import {shell} from 'electron'
import {Grid, Row, Col} from 'react-flexbox-grid'
import {List, ListItem} from 'material-ui/List'
import autobind from 'autobind-decorator'
import UrlStore from '../../stores/urlStore'
import wailConstants from '../../constants/wail-constants'
import shallowCompare from 'react-addons-shallow-compare'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-new'
import IconButton from 'material-ui/IconButton'
import moment from 'moment'

const EventTypes = wailConstants.EventTypes
const From = wailConstants.From

let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

const noCaptures = () => (
  <List>

  </List>
)

const loading = () => (
  <RefreshIndicator
    size={50}
    left={70}
    top={0}
    loadingColor={"#FF9800"}
    status="loading"
  />
)

export default class InArchiveResults extends Component {

  constructor (...args) {
    super(...args)
    this.state = {
      view: null,
      visibility: 'hidden',
      loading: false,
      forWho: {
        col: '',
        url: ''
      }
    }
  }

  componentWillMount () {
    console.log('archival buttons cwm')
    UrlStore.on('checking-in-archive', this.checking)
    UrlStore.on('checking-in-archive-done', this.checkingDone)

  }

  componentWillUnmount () {
    console.log('archival buttons cwum')
    UrlStore.removeListener('checking-in-archive', this.checking)
    UrlStore.removeListener('checking-in-archive-done', this.checkingDone)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  @autobind
  checking (forWho) {
    console.log(forWho)
    this.setState({
      loading: true,
      view: <ListItem primaryText={'Checking Archive For Captures'}/>,
      visibility: 'visible',
      forWho
    })
  }

  @autobind
  haveCaptures (a) {
    let renderMe = []
    let dateRe = /(?:\/)(\d{14})(?:\/)/
    a.each((i, elem) => {
      let maybeCapture = dateRe.exec(elem.attribs.href)
      if (maybeCapture) {
        console.log(maybeCapture[ 1 ])
      }
      renderMe.push(
        <ListItem
          key={`${elem.attribs.href}`}
          style={{ cursor: 'default' }}
          primaryText={moment(+maybeCapture[ 1 ]).format('dddd, MMMM Do YYYY, h:mm:ss a')}
          rightIconButton={
            <IconButton onTouchTap={() => shell.openExternal(elem.attribs.href) }>
              <OpenInBrowser/>
            </IconButton>
          }
        />
      )
    })

    return renderMe
  }

  @autobind
  checkingDone ($) {
    let a = $('a')
    if (a.length === 0) {
      console.log('its empty')
      this.setState({
        view: <ListItem primaryText={'No Captures Are Contained In The Archive'}/>
      })
    } else {
      this.setState({
        view: this.haveCaptures(a)
      })
    }
  }

  render () {
    return (
      <Card style={{
        visibility: this.state.visibility,
        marginTop: '25px',
        width: '100%',
        height: '100%'
      }}>
        <Grid
          fluid
        >
          <Row>
            <Col xs>
              <CardHeader
                title={'Captures'}
                subtitle={this.state.forWho.url || ''}
              />
            </Col>
          </Row>
          <Row>
            <Col xs>
              <CardMedia style={{ width: '100%'}}>
                <List
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    maxHeight: '200px',
                    overflowY: 'scroll',
                    overflowX: 'hidden'
                  }}
                >
                  {this.state.view}
                </List>
              </CardMedia>
            </Col>
          </Row>
        </Grid>
      </Card>
    )
  }
}
/*
 <Card style={{
 visibility: this.state.visibility,
 width: '100%'
 }}>
 <CardHeader
 title={this.state.forWho.url || ''}
 subtitle={'Captures'}
 />
 <CardMedia style={{ width: '100%'}}>
 <List
 style={{
 width: '100%',
 minHeight: '200px',
 maxHeight: '300px',
 overflowY: 'scroll'
 }}
 >
 {this.state.view}
 </List>
 </CardMedia>
 </Card>
 */
import React, { Component, PropTypes } from 'react'
import { Card, CardActions, CardHeader, CardText, CardMedia, CardTitle } from 'material-ui/Card'
import { shell } from 'electron'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { List, ListItem } from 'material-ui/List'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import TextField from 'material-ui/TextField'
import * as notify from '../../../actions/notification-actions'
import Subheader from 'material-ui/Subheader'
import isURL from 'validator/lib/isURL'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import RaisedButton from 'material-ui/RaisedButton'
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-new'
import IconButton from 'material-ui/IconButton'
import url from 'url'
import S from 'string'
import * as urlActions from '../../../actions/archive-url-actions'
import moment from 'moment'

export default class CollectionSearch extends Component {

  static propTypes = {
    viewingCol: PropTypes.string.isRequired
  }

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: '',
      view: <ListItem primaryText={'No Search Made'}/>,
      loading: false,
    }
  }


  componentWillReceiveProps (nextProps, nextContext) {
    if (this.props.viewingCol !== nextProps.viewingCol) {
      this.setState({view: <ListItem primaryText={'No Search Made'}/>, searchText: ''})
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  @autobind
  checkingDone ($) {
    let a = $('a')
    if (a.length === 0) {
      console.log('its empty')
      this.setState({
        view: <ListItem key={`${this.props.viewingCol}-noArchives`} primaryText={'No Captures Are Contained In The Archive'}/>
      })
    } else {
      this.setState({
        view: this.haveCaptures(a)
      })
    }
  }

  @autobind
  check () {
    this.setState({
      loading: true,
      view: <ListItem key={`${this.props.viewingCol}-checking`} primaryText={'Checking Archive For Captures'}/>
    })
    urlActions.grabCaptures(this.state.searchText, this.props.viewingCol)
      .then($ => {
        this.checkingDone($)
      })
      .catch(error => {
        console.error(error)
        window.logger.error({ err: error, msg: 'error in querying wayback' })
        notify.notifyError(`An internal error occurred while seeing querying the archive ${this.props.viewingCol}`, true)
      })
  }

  @autobind
  handleChange (e) {
    this.setState({ searchText: e.target.value })
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

  render () {
    let { muiTheme } = this.context
    return (
        <Grid
          fluid
          style={{
            border: `thin solid ${muiTheme.palette.accent3Color}`,
            width: '94%',
            height: '100%'
          }}
        >
          <Row top="xs">
            <Col xs>
              <CardTitle
                subtitle={'Search For Captures'}
              />
            </Col>
          </Row>
          <Row center="xs">
            <Col xs>
              <TextField
                style={{ marginLeft: '15px' }}
                fullWidth
                floatingLabelText='URL'
                id='archive-url-input'
                value={this.state.searchText}
                onChange={this.handleChange}
              />
            </Col>
            <Col xs>
              <RaisedButton
                style={{ marginTop: '25px' }}
                label={'Search'}
                onTouchTap={this.check}/>
            </Col>
          </Row>
          <Row bottom="xs">
            <Col xs>
              <List
                style={{
                  width: '100%',
                  minHeight: '185px',
                  maxHeight: '185px',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}
              >
                <Subheader>Search Results</Subheader>
                {this.state.view}
              </List>
            </Col>
          </Row>
        </Grid>
    )
  }
}

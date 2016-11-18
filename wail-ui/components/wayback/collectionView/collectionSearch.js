import React, {Component, PropTypes} from 'react'
import {shell} from 'electron'
import {List, ListItem} from 'material-ui/List'
import {Card, CardActions, CardMedia, CardTitle} from 'material-ui/Card'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import TextField from 'material-ui/TextField'
import * as notify from '../../../actions/notification-actions'
import RaisedButton from 'material-ui/RaisedButton'
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-new'
import IconButton from 'material-ui/IconButton'
import * as urlActions from '../../../actions/archive-url-actions'
import moment from 'moment'

export default class CollectionSearch extends Component {

  static propTypes = {
    viewingCol: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired
  }

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: '',
      view: <ListItem primaryText={'No Search Made'} />,
      loading: false
    }
  }

  componentWillReceiveProps (nextProps, nextContext) {
    if (this.props.viewingCol !== nextProps.viewingCol) {
      this.setState({ view: <ListItem primaryText={'No Search Made'} />, searchText: '' })
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
        view: <ListItem key={`${this.props.viewingCol}-noArchives`}
          primaryText={'No Captures Are Contained In The Archive'} />
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
      view: <ListItem key={`${this.props.viewingCol}-checking`} primaryText={'Checking Archive For Captures'} />
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
          primaryText={moment(maybeCapture[ 1 ], 'YYYYMMDDHHmmss').format('dddd, MMMM Do YYYY, h:mm:ss a')}
          rightIconButton={
            <IconButton onTouchTap={() => shell.openExternal(elem.attribs.href)}>
              <OpenInBrowser />
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
      <Card>
        <CardTitle
          subtitle={'Search For Captures'}
        />
        <CardActions>
          <TextField
            style={{ marginLeft: '15px', width: '75%' }}
            floatingLabelText='URL'
            id='archive-url-input'
            value={this.state.searchText}
            onChange={this.handleChange}
          />
          <RaisedButton
            style={{ marginTop: '25px', marginLeft: '15px' }}
            label={'Search'}
            onTouchTap={this.check} />
        </CardActions>
        <CardMedia>
          <List
            style={{
              maxHeight: `${this.props.height - 57}px`,
              overflowY: 'auto',
              overflowX: 'hidden',
              border: 'thin 1px #d9d9d9'
            }}
          >
            {this.state.view}
          </List>
        </CardMedia>
      </Card>
    )
  }
}

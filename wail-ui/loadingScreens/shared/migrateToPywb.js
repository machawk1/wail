import React, { Component, PropTypes } from 'react'
import { TableRow, TableRowColumn } from 'material-ui/Table'
import autobind from 'autobind-decorator'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import SvgIcon from 'material-ui/svg-icons/action/done'
import wc from '../../constants/wail-constants'
import LoadingDispatcher from './loadingDispatcher'
import LoadingStore from './loadingStore'
import fs from 'fs-extra'
import Dialog from 'material-ui/Dialog'
import Promise from 'bluebird'
import {
  ToastContainer,
  ToastMessage
} from 'react-toastr'
import S from 'string'
import cp from 'child_process'
import FlatButton from 'material-ui/FlatButton'
import path from 'path'
import FitText from 'react-fittext'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

function movePywbStuff (moveMe) {
  return new Promise((resolve, reject) => {
    fs.copy(moveMe.from, moveMe.to, (err) => {
      if (err) {
        console.error(moveMe, err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const style = {
  container: {
    position: 'relative'
  },
  refresh: {
    display: 'inline-block',
    position: 'relative'
  }
}

const ToastMessageFactory = React.createFactory(ToastMessage.animation)

export default class MigratePywb extends Component {
  static propTypes = {
    migrate: PropTypes.bool.isRequired,
    settings: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    let message = 'Waiting to Migrate. Depends on Checking Heritrix, Wayback Status'
    // props.migrate ? 'Waiting to Migrate. Depends on Checking Heritrix, Wayback Status' : 'Migrating to pywb',
    if (props.migrate) {
      message = 'Migrating to pywb'
    } else {
      message = 'no script for days'
    }
    this.state = {
      progMessage: message,
      completed: 0,
      done: false,
      open: true
    }
    this.container = null
  }

  componentWillMount () {
    LoadingStore.on('migrate', this.doMigration)
  }

  componentWillUnMount () {
    LoadingStore.removeListener('migrate', this.doMigration)
  }

  @autobind
  handleCloseYes () {
    this.setState({ open: false }, () => {
      this.doMigration()
    })
  }

  @autobind
  handleClose () {
    this.props.settings.set('migrate', false)
    this.setState({ open: false }, () => {
      this.done()
    })
  }

  @autobind
  done () {
    // add some latency to allow for the user to see our update as proof we did the on load check
    this.setState({ done: true }, () => {
      // console.log('checkServices done=true setState callback')
      LoadingDispatcher.dispatch({
        type: wc.Loading.MIGRATION_DONE
      })
    })
  }

  @autobind
  doMigration () {
    console.log('migrating to pywb')
    this.setState({ progMessage: 'Migrating to pywb' }, () => {
      console.log('migrating to pywb')
      if (this.props.settings.get('migrate')) {
        this.doMigaration()
      }
    })
  }

  @autobind
  updateProgress () {
    this.setState({ progMessage: 'Migrating to pywb' }, () => {
      console.log('migrating to pywb')
      if (this.props.settings.get('migrate') && !this.state.done) {
        this.doMigaration()
      }
    })
  }

  @autobind
  getMoveArray () {
    let templates = this.props.settings.get('pywb.templates')
    let statics = this.props.settings.get('pywb.statics')
    let aColTemplate = S(this.props.settings.get('collections.colTemplate')).template({ col: 'Wail' }).s
    let baseTemplate = this.props.settings.get('collections.templateDir')
    let aCollStatic = S(this.props.settings.get('collections.colStatic')).template({ col: 'Wail' }).s
    let baseStatic = this.props.settings.get('collections.staticsDir')
    return [
      {
        from: templates,
        to: aColTemplate
      },
      {
        from: templates,
        to: baseTemplate
      },
      {
        from: statics,
        to: baseStatic
      },
      {
        from: statics,
        to: aCollStatic
      }
    ]
  }

  @autobind
  askForWarcs (dialog) {
    return new Promise((resolve, reject) => {
      let messageOpts = {
        type: 'question',
        buttons: [ 'Yes', 'No' ],
        title: 'Add Warcs',
        message: 'Do you have any (w)arc files that you wish to add?',
        detail: 'This adds those (w)arc files to the default collection Wail',
        cancelId: 666
      }
      dialog.showMessageBox(messageOpts, (response) => {
        if (response === 0) {
          resolve(response)
        } else {
          reject({ response })
        }
      })
    })
  }

  @autobind
  doMigaration () {
    const { app, dialog } = require('electron').remote
    let getWarcOpts = {
      title: 'Select Directory Containing (w)arcs',
      filters: [
        { name: '(w)arcs', extensions: [ 'warc', 'arc' ] }
      ],
      properties: [ 'openDirectory' ]
    }
    this.props.settings.set('migrate', false)
    dialog.showOpenDialog(getWarcOpts, warcs => {
      console.log(warcs)
      if (warcs) {
        let exec = S(this.props.settings.get('pywb.addWarcsToCol')).template({
          col: 'Wail',
          warcs: path.join(warcs[ 0 ], '*.warc')// `${warcs[ 0 ]}/`
        }).s
        let archives = this.props.settings.get('warcs')
        let opts = {
          cwd: archives
        }
        cp.exec(exec, opts, (error, stdout, stderr) => {
          if (error) {
            console.error(error)
            this.refs.container.error(
              'There was an error migrating warcs to the default collection Wail'
            )
          }
          let c1 = ((stdout || ' ').match(/INFO/g) || []).length
          let c2 = ((stderr || ' ').match(/INFO/g) || []).length
          let count = c1 === 0 ? c2 : c1
          // `Migrated ${count} warcs to the default collection Wail`
          this.container.success(
            <FitText maxFontSize={10}>
              <p>{`Migrated ${count} warcs to the default collection Wail`}</p>
            </FitText>
          )
          this.done()
        })
      } else {
        this.done()
      }
    })
  }

  render () {
    if (this.props.migrate) {
      const actions = [
        <FlatButton
          label='No'
          primary
          onTouchTap={this.handleClose}
        />,
        <FlatButton
          label='Yes'
          primary
          onTouchTap={this.handleCloseYes}
        />
      ]
      console.log('migrating to pywb')
      var check_or_done
      if (this.state.done) {
        check_or_done = (
            <SvgIcon />
        )
      } else {
        check_or_done = (
          <div>
            <Dialog
              title='Dialog With Actions'
              actions={actions}
              modal
              open={this.state.open}
            >
              Do you have any (w)arc files that you wish to add to
              the default collection Wail?
            </Dialog>
            <ToastContainer
              toastMessageFactory={ToastMessageFactory}
              ref={(c) => this.container = c}
              preventDuplicates
              newestOnTop
              className='toast-top-center'
            />
            <RefreshIndicator
              size={40}
              left={10}
              top={0}
              status='loading'
              style={style.refresh}
            />
          </div>
        )
      }
      return (
        <TableRow>
          <TableRowColumn>
            <p>
              {this.state.progMessage}
            </p>
          </TableRowColumn>
          <TableRowColumn>

            {check_or_done}
          </TableRowColumn>
        </TableRow>
      )
    } else {
      return (
        <TableRow />
      )
    }
  }
}

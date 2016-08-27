import React, { Component, PropTypes } from 'react'
import { TableRow, TableRowColumn } from 'material-ui/Table'
import autobind from 'autobind-decorator'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import SvgIcon from 'material-ui/svg-icons/action/done'
import wc from '../../constants/wail-constants'
import LoadingDispatcher from './loadingDispatcher'
import LoadingStore from './loadingStore'
import fs from 'fs-extra'
import Promise from 'bluebird'
import {
  ToastContainer,
  ToastMessage,
} from "react-toastr"
import S from 'string'
import cp from 'child_process'
import shelljs from 'shelljs'
import path from 'path'

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
    position: 'relative',
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
  },
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
      done: false
    }
    this.container = null
  }

  componentWillMount () {
    LoadingStore.on('check-services-done', this.updateProgress)
    LoadingStore.on('migrate', this.doMigration)
  }

  componentWillUnMount () {
    LoadingStore.removeListener('check-services-done', this.updateProgress)
    LoadingStore.removeListener('migrate', this.doMigration)
  }

  @autobind
  done () {
    // add some latency to allow for the user to see our update as proof we did the on load check
    this.setState({ done: true }, () => {
      // console.log('checkServices done=true setState callback')
      this.props.settings.set('migrate', false)
      LoadingDispatcher.dispatch({
        type: wc.Loading.MIGRATION_DONE
      })
    })
  }

  @autobind
  doMigration () {
    console.log('migrating to pywb')
    this.doMigaration()
  }

  @autobind
  updateProgress () {
    this.setState({ progMessage: 'Migrating to pywb' }, () => {
      console.log('migrating to pywb')
      this.doMigaration()
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
  doMigaration () {
    let archives = this.props.settings.get('warcs')
    let opts = {
      cwd: archives
    }
    let exec = S(this.props.settings.get('pywb.newCollection')).template({ col: 'Wail' }).s
    console.log(exec)
    cp.exec(exec, opts, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr, error)
        this.container.error(
          'There was an error creating the default collection Wail'
        )

      } else {
        let ret = shelljs.ls(`${this.props.settings.get('warcs')}/*.warc`)
        if (ret.length > 0) {
          this.container.success('Created Collection Wail migrating existing warcs')
          let exec = S(this.props.settings.get('pywb.addWarcsToCol')).template({
            col: 'Wail',
            warcs: `${archives}/*.warc`
          }).s
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
            this.container.success(`Migrated ${count} warcs to the default collection Wail`)

            let moveArray = this.getMoveArray()
            Promise.map(moveArray, movePywbStuff)
              .then(() => {
                let backup = path.normalize(`${this.props.settings.get('warcs')}/warcBackup`)
                fs.ensureDir(backup, err => {
                  if (!err) {
                    ret.forEach(warc => {
                      fs.move(warc, path.normalize(`${backup}/${path.basename(warc)}`), err => {
                        if (err) {
                          console.error(err)
                        } else {
                          console.log('moved ', warc)
                        }
                      })
                    })
                    this.done()
                  }
                })
              })
              .catch(moveError => {
                console.error(moveError)
                this.refs.container.error(
                  'There was an error migrating pywb template static files'
                )
              })
          })
        } else {
          this.container.success('Created Collection Wail no warc files present to migrate')
          this.done()
        }

      }

    })
  }

  render () {
    if (this.props.migrate) {
      console.log('migrating to pywb')
      this.doMigaration()
      var check_or_done
      if (this.state.done) {
        check_or_done = <SvgIcon />
      } else {
        check_or_done = (
          <RefreshIndicator
            size={40}
            left={10}
            top={0}
            status='loading'
            style={style.refresh}
          />

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
            <div>
              <ToastContainer
                toastMessageFactory={ToastMessageFactory}
                ref={(c) => this.container = c}
                preventDuplicates={true}
                newestOnTop={true}
                className="toast-top-center"
              />
              {check_or_done}
            </div>
          </TableRowColumn>
        </TableRow>
      )
    } else {
      return (
        <TableRow>

        </TableRow>
      )
    }
  }
}

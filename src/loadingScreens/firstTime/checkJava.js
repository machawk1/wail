import React, { Component, PropTypes } from 'react'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { ListItem } from 'material-ui/List'
import fs from 'fs-extra'
import shelljs from 'shelljs'
import named from 'named-regexp'
import autobind from 'autobind-decorator'
import cp from 'child_process'
import S from 'string'
import request from 'request'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import SvgIcon from 'material-ui/svg-icons/action/done'

const style = {
  container: {
    position: 'relative',
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
  },
}

let checkInterval = null
const osx_java7DMG = 'http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg'

export default class CheckJava extends Component {
  static propTypes = {
    checkJava: PropTypes.func.isRequired,
  }

  constructor (props, context) {
    super()
    this.state = {
      checkedJava: false,
      haveCorrectJava: false,
      installJava: false,
      javaV: '',
      progMessage: 'Checking Java'
    }
  }

  @autobind
  whichJava () {

    clearInterval(checkInterval)

    let javaPath = process.env[ 'JAVA_HOME' ] || process.env[ 'JDK_HOME' ] || process.env[ 'JRE_HOME' ]
    if (javaPath) {
      let jp = S(javaPath)
      if (jp.contains('1.7')) {
        console.log('1.7')
        this.setState({ checkedJava: true, haveCorrectJava: true, progMessage: 'Java 1.7 detected' })
      } else {
        console.log('not 1.7 or not named 1.7')
        this.setState({
          checkedJava: true,
          haveCorrectJava: false,
          progMessage: 'Java 1.x detected but not correct version. But it is ok ;)'
        })
      }
    } else {
      if (process.platform == 'darwin') {
        this.checkJavaOSX()
      } else {
        this.executeJavaVersion()
      }
    }
  }

  @autobind
  checkJavaOSX () {
    let jvmRegex = named.named(/\/[a-zA-z/]+(:<jvm>.+)/)
    let jvms = shelljs.ls('-d', '/Library/Java/JavaVirtualMachines/*.jdk')
    let len = jvms.length
    let haveCorrectJava = false
    let checkedJava = true
    if (len > 0) {
      for (let i = 0; i < len; ++i) {
        let jvm = jvms[ i ]
        let jvmTest = jvmRegex.exec(jvm)
        if (jvmTest) {
          if (S(jvmTest.capture('jvm')).contains('1.7')) {
            console.log('you have the correct jvm')
            haveCorrectJava = true
            break
          }
        }
        console.log(jvmTest.capture('jvm'))
      }
      if (haveCorrectJava) {
        this.setState({ haveCorrectJava, checkedJava, progMessage: 'Java 1.7 detected' })
      } else {
        this.setState({
          haveCorrectJava,
          checkedJava,
          progMessage: 'Java 1.x detected but not correct version. But it is ok ;)'
        })
      }
    } else {
      this.setState({ haveCorrectJava, checkedJava, progMessage: 'No Java detected', installJava: true })
    }

  }

  @autobind
  executeJavaVersion () {
    cp.exec('java -version', (err, stdout, stderr) => {
      let jvRegex = named.named(/java version "(:<jv>[0-9._]+)"/g)
      let haveCorrectJava = false
      let checkedJava = true
      let progMessage
      let jvTest = jvRegex.exec(stderr)
      if (jvTest) {
        let jv = jvTest.capture('jv')
        if (S(jv).contains('1.7')) {
          console.log('Java 1.7 detected')
          haveCorrectJava = true
          progMessage = 'Java 1.7 detected'
        } else {
          console.log('Java 1.x detected but not correct version. But it is ok ;)')
          progMessage = 'Java 1.x detected but not correct version. But it is ok ;)'
        }
      } else {
        console.log('Java was not detected. But it is ok ;)')
        progMessage = 'Java was not detected. But it is ok ;)'
      }

      this.setState({ haveCorrectJava, checkedJava, progMessage })
    })
  }


  @autobind
  downloadJDK (response) {
    console.log(response)
    const app = require('electron').remote.app
    if (response === 1 || response === 666) {
      app.exit(1)
    } else {
      request.get(osx_java7DMG)
        .on('response', res => {
          console.log(res.statusCode) // 200
          console.log(res.headers[ 'content-type' ])
        }).on('error', err => {
        console.error(err)
      }).pipe(fs.createWriteStream('/tmp/java7.dmg'))
        .on('close', () => {
          console.log('done')
          cp.exec('hdiutil attach /tmp/java7.dmg', (err, stdout, stderr) => {
            if (err) {
              console.error(err)
            } else {
              console.log(stderr, stdout)
              cp.exec('open /Volumes/JDK\\ 7\\ Update\\ 79/JDK\\ 7\\ Update\\ 79.pkg', (err, stdout, stderr) => {
                if(err) {
                  console.error(err)
                } else {
                  console.log(stderr,stdout)
                  app.exit(1)
                }
              })
            }
          })

        })
    }
  }

  render () {

    let check_or_done
    if (!this.state.checkedJava) {
      check_or_done =
        <RefreshIndicator size={40}
                          left={10}
                          top={0}
                          status="loading"
                          style={style.refresh}

        />

      checkInterval = setInterval(this.whichJava, 3000)

    } else {
      check_or_done = <SvgIcon />
      if (true) {//this.state.installJava) {
        const { dialog } = require('electron').remote
        dialog.showMessageBox({
          type: 'question',
          title: 'Download Required JDK',
          detail: 'In order to use Wail you must have the correct jdk. Otherwise you can not use this this tool.',
          buttons: [ 'Yes', 'No' ],
          message: 'Java needs to be installed for Heritrix and Wayback',
          cancelId: 666,
        }, this.downloadJDK)
      } else {
        console.log('carry on')
      }

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
  }
}

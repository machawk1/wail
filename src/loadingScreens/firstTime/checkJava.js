import React, {Component, PropTypes} from 'react'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import shelljs from 'shelljs'
import named from 'named-regexp'
import autobind from 'autobind-decorator'
import cp from 'child_process'
import S from 'string'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import SvgIcon from 'material-ui/svg-icons/action/done'
import wc from '../../constants/wail-constants'
import LoadingDispatcher from '../shared/loadingDispatcher'

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

export default class CheckJava extends Component {

  constructor (props, context) {
    super(props, context)
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
          progMessage: 'Java detected'
        })
      }
      LoadingDispatcher.dispatch({
        type: wc.Loading.JAVA_CHECK_DONE
      })
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
    var type
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
      console.log('carry on')
      if (haveCorrectJava) {
        this.setState({ haveCorrectJava, checkedJava, progMessage: 'Java 1.7 detected' })
      } else {
        this.setState({
          haveCorrectJava,
          checkedJava,
          progMessage: 'Java detected.'
        })
      }
      type = wc.Loading.JAVA_CHECK_DONE

    } else {
      this.setState({ haveCorrectJava, checkedJava, progMessage: 'No Java detected', installJava: true })
      type = wc.Loading.DOWNLOAD_JAVA
    }
    LoadingDispatcher.dispatch({ type })
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
          console.log('Java detected.')
          progMessage = 'Java detected.'
        }
      } else {
        console.log('Java was not detected. But it is ok ;)')
        progMessage = 'Java was not detected. But that is ok ;)'
      }
      this.setState({ haveCorrectJava, checkedJava, progMessage })
      LoadingDispatcher.dispatch({
        type: wc.Loading.JAVA_CHECK_DONE
      })
    })
  }

  render () {
    var check_or_done
    if (this.state.checkedJava) {
      check_or_done = <SvgIcon />
    } else {
      check_or_done =
        <RefreshIndicator
          size={40}
          left={10}
          top={0}
          status='loading'
          style={style.refresh}
        />
      checkInterval = setInterval(this.whichJava, 3000)
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

import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import { blueGrey50, darkBlack, lightBlue900 } from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Header from './header'
import Footer from './footer'
import Dimensions from 'react-dimensions'
import styles from '../styles/styles'
import bunyan from 'bunyan'
import { remote } from 'electron'

const ringbuffer = new bunyan.RingBuffer({ limit: 100 })

const logger = bunyan.createLogger({
  name: 'wail-ui',
  streams: [
    {
      level: 'debug',
      path: remote.getGlobal('wailUILogp'),
      src: true
    },
    {
      level: 'debug',
      type: 'raw',    // use 'raw' to get raw log record objects
      stream: ringbuffer
    }
  ]
})

const baseTheme = getMuiTheme({
  tabs: {
    backgroundColor: blueGrey50,
    textColor: darkBlack,
    selectedTextColor: darkBlack
  },
  inkBar: {
    backgroundColor: lightBlue900
  }
})

export default class Layout extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired
  }
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
    logger: PropTypes.object.isRequired,
  }

  constructor (props, context) {
    super(props, context)
    this.state = { muiTheme: baseTheme }
  }

  getChildContext () {
    return {
      muiTheme: this.state.muiTheme,
      logger: logger
    }
  }

  render () {
    return (
      <Grid fluid className="layOutGrid">
        <Row>
          <Col xs>
            <Header />
          </Col>
        </Row>
        <Row>
          <Col xs>
            <div style={styles.root}>
              {this.props.children}
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs>
            <Footer />
          </Col>
        </Row>
      </Grid>
    )
  }
}


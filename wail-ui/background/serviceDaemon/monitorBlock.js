import React, { Component, PropTypes } from 'react'
import {remote,ipcRender} from 'electron'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Paper from 'material-ui/Paper'
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar'
import IconButton from 'material-ui/IconButton';
import CodeIcon from 'material-ui/svg-icons/action/code'
import '../../css/splitpane.css'
import Dimensions from 'react-dimensions'
import { Grid, Row, Col } from 'react-flexbox-grid'

const baseTheme = getMuiTheme(lightBaseTheme)
const settings = remote.getGlobal('settings')

export default class MonitorBlock extends Component {

  constructor (...args) {
    super(...args)

  }

  getChildContext () {

  }

  render () {
    return (
      <Grid fluid>
        <Row>
          <Col xs >
            <Toolbar>
              <ToolbarGroup>
                <ToolbarTitle text={'Heritrix'} />
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton touch={true} tooltip={'view'}>
                  <CodeIcon />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </Col>
          <Col xs >
            <Toolbar>
              <ToolbarGroup>
                <ToolbarTitle text={'Pywb'} />
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton touch={true} tooltip={'view'}>
                  <CodeIcon />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </Col>
        </Row>
        <Row>
          <Col xs >
            <h3>indexing wail</h3>
          </Col>
          <Col xs >
            <h3>indexing something else</h3>
          </Col>
        </Row>
      </Grid>

    )
  }
}
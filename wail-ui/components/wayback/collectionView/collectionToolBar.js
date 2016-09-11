import React, { Component, PropTypes } from 'react'
import { Tabs, Tab } from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import autobind from 'autobind-decorator'
import { Grid, Row, Col } from 'react-flexbox-grid'
import OpenButton from 'material-ui/FlatButton'
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import NewCollection from './newCollection'

export default class CollectionToolBar extends Component {

  render () {
    return (
      <Row>
        <Col xs>
          <Toolbar>
            <ToolbarGroup firstChild>
              <ToolbarTitle text='Create New Collection' />
            </ToolbarGroup>
            <ToolbarGroup lastChild />
          </Toolbar>
        </Col>
      </Row>
    )
  }

}

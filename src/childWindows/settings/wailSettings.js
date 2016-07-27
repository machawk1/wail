import React, { Component, PropTypes } from 'react'
import { ipcRenderer, remote } from 'electron'
import autobind from 'autobind-decorator'
import { Tab } from 'material-ui/Tabs'
import {Grid, Row, Column} from 'react-cellblock'

const settings = remote.getGlobal('settings')

export default class WailSettings extends Component {

  render() {
    return (
      <Grid gutterWidth={20} flexable={true} columnWidth={100}>
        <Row>
          <Column width="1/2">

          </Column>
          <Column width="1/2">

          </Column>
        </Row>
      </Grid>
    )
  }
}

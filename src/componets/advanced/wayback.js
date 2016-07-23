import React, {Component} from 'react'
import {shell, remote} from 'electron'
import RaisedButton from 'material-ui/RaisedButton'
import {Grid, Row, Column} from 'react-cellblock'
import autobind from 'autobind-decorator'
import ServiceStore from '../../stores/serviceStore'

const settings = remote.getGlobal('settings')
const styles = {
  button: {
    margin: 12,
  },
}

export default class WayBackTab extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      showWayback: ServiceStore.waybackStatus()
    }
  }

  @autobind
  onClickViewWayback (event) {
    console.log('View Wayback')
    shell.openExternal(settings.get('wayback.uri_wayback'))
  }

  @autobind
  viewWaybackConf (event) {
    shell.openItem(settings.get('wayBackConf'))
  }

  render () {
    return (
      <Grid>
        <Row>
          <Column width='1/2'>
            <RaisedButton
              label='View Wayback in Browser'
              labelPosition='before'
              style={styles.button}
              onMouseDown={this.onClickViewWayback}
            />
          </Column>
          <Column width='1/2'>
            <RaisedButton
              label='Edit Wayback Configuration'
              labelPosition='before'
              style={styles.button}
              onMouseDown={this.viewWaybackConf}
            />
          </Column>
        </Row>
      </Grid>
    )
  }
}

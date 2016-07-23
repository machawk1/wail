import React, {Component} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {Grid, Row, Column} from 'react-cellblock'
import {shell, remote} from 'electron'

const settings = remote.getGlobal('settings')

export default class Misc extends Component {
  render () {
    return (
      <Grid>
        <Row>
          <Column width='1/2'>
            <RaisedButton
              label='View Archive Files'
              labelPosition='before'
              style={{ margin: 12 }}
              onMouseDown={() => shell.openItem(settings.get('warcs'))}
            />
          </Column>
          <Column width='1/2'>
            <RaisedButton
              label="Check Updates"
              labelPosition="before"
              style={{ margin: 12 }}
              onMouseDown={() => shell.openExternal('https://github.com/N0taN3rd/wail')}
            />
          </Column>
        </Row>
      </Grid>
    )
  }
}

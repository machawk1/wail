import React, { Component } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import { Grid, Row } from 'react-cellblock'
import autobind from 'autobind-decorator'
import { ipcRenderer, remote, shell } from 'electron'
import HeritrixJobList from './heritrix-joblist'

const styles = {
  button: {
    margin: 12
  }
}

const settings = remote.getGlobal('settings')

export default class HeritrixTab extends Component {

  @autobind
  onClickNewCrawl (event) {
    console.log('New Crawl')
    ipcRenderer.send('open-newCrawl-window')
  }

  @autobind
  onClickLaunchWebUI (event) {
    shell.openExternal(settings.get('heritrix.web_ui'))
  }

  render () {
    return (
      <Grid gutterWidth={20} flexable={true} columnWidth={100}>
        <Row>
          <HeritrixJobList />
        </Row>
        <Row>
          <Toolbar>
            <ToolbarGroup >
              <RaisedButton
                label='Configure New Crawl'
                labelPosition='before'
                style={styles.button}
                onMouseDown={this.onClickNewCrawl}
              />
            </ToolbarGroup>
            <ToolbarGroup>
              <RaisedButton
                label='Launch Web UI'
                labelPosition='before'
                style={styles.button}
                onMouseDown={this.onClickLaunchWebUI}
              />
            </ToolbarGroup>
          </Toolbar>
        </Row>
      </Grid>
    )
  }
}

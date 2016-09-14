import React, { Component } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import IconButton from 'material-ui/IconButton'
import ToolTip from 'material-ui/internal/Tooltip'
import { Grid, Row, Col } from 'react-flexbox-grid'
import autobind from 'autobind-decorator'
import OpenBrowserIcon from 'material-ui/svg-icons/action/open-in-browser'
import AddCrawlIcon from 'material-ui/svg-icons/content/add'
import JobScanIcon from 'material-ui/svg-icons/av/playlist-add-check'
import { ipcRenderer, remote, shell } from 'electron'
import HeritrixJobList from './heritrix-joblist'
import { rescanJobDir } from '../../actions/heritrix-actions'
import Dimensions from 'react-dimensions'
const styles = {
  button: {
    margin: 12
  }
}

const settings = remote.getGlobal('settings')

export default class HeritrixTab extends Component {

  @autobind
  onClickNewCrawl (event) {
    // console.log('New Crawl')
    ipcRenderer.send('open-newCrawl-window')
  }

  @autobind
  onClickLaunchWebUI (event) {
    shell.openExternal(settings.get('heritrix.web_ui'))
  }

  render () {
    return (
      <Grid fluid className='basicTabLayout'>
        <Row>
          <Col xs>
            <HeritrixJobList />
          </Col>
        </Row>
        <Row>
          <Col xs>
            <Toolbar>
              <ToolbarGroup firstChild>
                <RaisedButton
                  icon={<AddCrawlIcon />
                  }
                  label='New Crawl'
                  labelPosition='before'
                  style={styles.button}
                  onMouseDown={this.onClickNewCrawl}
                />
              </ToolbarGroup>
              <ToolbarGroup >
                <RaisedButton
                  icon={<JobScanIcon />}
                  label='Rescan Job Directory'
                  labelPosition='before'
                  style={styles.button}
                  onMouseDown={() => rescanJobDir()}
                />
              </ToolbarGroup>
              <ToolbarGroup lastChild>
                <RaisedButton
                  icon={<OpenBrowserIcon />}
                  label='Launch Web UI'
                  labelPosition='before'
                  style={styles.button}
                  onMouseDown={this.onClickLaunchWebUI}
                />
              </ToolbarGroup>
            </Toolbar>
          </Col>
        </Row>
      </Grid>
    )
  }
}

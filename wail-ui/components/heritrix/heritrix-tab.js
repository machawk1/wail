import React, {Component} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'
import {AutoSizer} from 'react-virtualized'
import OpenBrowserIcon from 'material-ui/svg-icons/action/open-in-browser'
import AddCrawlIcon from 'material-ui/svg-icons/content/add'
import JobScanIcon from 'material-ui/svg-icons/av/playlist-add-check'
import {ipcRenderer, remote, shell} from 'electron'
import HeritrixJobList from './heritrix-joblist'
import {rescanJobDir} from '../../actions/heritrix-actions'
import ColStore from '../../stores/collectionStore'
const styles = {
  button: {
    margin: 12
  }
}

const settings = remote.getGlobal('settings')

export default class HeritrixTab extends Component {

  onClickNewCrawl (event) {
    // console.log('New Crawl')
    ipcRenderer.send('open-newCrawl-window', ColStore.colNames)
  }

  onClickLaunchWebUI (event) {
    shell.openExternal(settings.get('heritrix.web_ui'))
  }

  render () {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ width, height }}>
              <HeritrixJobList height={height} />
            </div>
          )}
        </AutoSizer>
        <Toolbar className='layoutFooter'>
          <ToolbarGroup firstChild>
            <RaisedButton
              icon={<AddCrawlIcon />}
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
      </div>
    )
  }
}

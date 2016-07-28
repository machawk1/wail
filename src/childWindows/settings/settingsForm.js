import React, {Component, PropTypes} from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import RaisedButton from 'material-ui/RaisedButton'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MenuItem from 'material-ui/MenuItem'
import {List, ListItem} from 'material-ui/List'
import {ipcRenderer, remote} from 'electron'
import autobind from 'autobind-decorator'
import FSLocationChooser from './fsLocationChooser'
import FileChooser from './fileChooser'
import SettingHardReset from './settingHardReset'

const baseTheme = getMuiTheme(lightBaseTheme)
const settings = remote.getGlobal('settings')

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  slide: {
    padding: 10,
  },
}

export default class SettingsForm extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      muiTheme: baseTheme,
      slideIndex: 0,
    }
  }

  @autobind
  handleChange (value) {
    this.setState({
      slideIndex: value,
    })
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }

  @autobind
  buildWS () {
    let fromSettingsFile = [ 'cdx', 'warcs' ]
      .map(it => <FSLocationChooser key={`fslc${it}`} whichSetting={it} warnOnChange={true} settings={settings}/>)
    let otherSettings = [ { which: 'archives', alt: 'Memgator Archive List', useAlt: true } ]
      .map(it => <FileChooser whichSetting={it.which} settings={settings} useAltName={it.useAlt} altName={it.alt}/>)
    return fromSettingsFile.concat(otherSettings).concat(
      <SettingHardReset
        channel="setting-hard-reset"
        name="Settings Hard Reset"
      />)
  }


  buildWBS(){

  }

  render () {
    return (
      <div style={{
        overflow: 'hidden',
        overflowY: 'scroll'
      }}>
        <List>
          <ListItem
            primaryText="Wail"
            primaryTogglesNestedList={true}
            nestedItems={
              this.buildWS()
            }
          />
          <ListItem
            primaryText="Wayback"
            primaryTogglesNestedList={true}
            nestedItems={
              this.buildWS()
            }
          />
        </List>
      </div>

    )
  }
}

/*
 <div>
 <Tabs
 onChange={this.handleChange}
 value={this.state.slideIndex}
 >
 <Tab label="WAIL" value={0}/>
 <Tab label="Heritrix" value={1}/>
 <Tab label="Wayback" value={2}/>
 </Tabs>
 <SwipeableViews
 index={this.state.slideIndex}
 onChangeIndex={this.handleChange}
 >
 <WailSettings slideStyle={styles.slide}/>
 <div style={styles.slide}>
 slide n°2
 </div>
 <div style={styles.slide}>
 slide n°3
 </div>
 </SwipeableViews>
 </div>
 */
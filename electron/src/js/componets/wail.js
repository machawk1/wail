import React, {Component, PropTypes} from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import darkBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import AppBar from 'material-ui/AppBar'
import {Tabs, Tab} from 'material-ui/Tabs'
import Basic from './basic'

const baseTheme = getMuiTheme(darkBaseTheme)

class Wail extends Component {
   constructor(props, context) {
      super(props, context)
      this.state = {key: 'basic'}
      this.handleSelect = this.handleSelect.bind(this)
   }



   getChildContext() {
      return {muiTheme: getMuiTheme(baseTheme)}
   }

   handleSelect(selectedKey) {
      this.setState({key: selectedKey})
   }

   render() {
      console.log("HI hellow")
      console.log("hehehe dasass ")
      console.log("hehehe dasass e ")
      return (
          <Tabs
              value={this.state.value}
              onChange={this.handleChange}
          >
             <Tab label="Basic" value="basic" >
               < Basic/>
             </Tab>
             <Tab label="Advanced" value="advanced">
                <div>
                   <p>
                      This is another example of a controllable tab. Remember, if you
                      use controllable Tabs, you need to give all of your tabs values or else
                      you wont be able to select them.
                   </p>
                </div>
             </Tab>
          </Tabs>

      )
   }
}

Wail.childContextTypes = {
   muiTheme: PropTypes.object.isRequired,
}

export default Wail


/*
 <Tab.Container id="theTabs" onSelect={this.handleSelect} activeKey={this.state.key}>
 <div>
 <Nav bsStyle="tabs" justified pullLeft>
 <NavItem eventKey={'basic'}>Basic</NavItem>
 <NavItem eventKey={'advanced'}>Advanced</NavItem>
 </Nav>
 <Tab.Content animation>
 <Tab.Pane animation eventKey={'basic'}>
 <Basic />
 </Tab.Pane>
 <Tab.Pane animation eventKey={'advanced'}>
 <p>HI</p>
 </Tab.Pane>
 </Tab.Content>
 </div>
 </Tab.Container>
 */

import React, {Component, PropTypes} from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {Tabs, Tab} from 'material-ui/Tabs'
import BasicTab from './basic/basic-tab'
import AdvancedTab from './advanced/advancedTab'
import Debug from './debug-element'


const baseTheme = getMuiTheme(lightBaseTheme)

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
      return (
         <div>
         <Tabs
            value={this.state.value}
            onChange={this.handleChange}
         >
            <Tab label="Basic" value="basic">
               <BasicTab />
            </Tab>
            <Tab label="Advanced" value="advanced">
               <AdvancedTab />
            </Tab>
         </Tabs>
            <Debug/>
          </div>

      )
   }
}

Wail.childContextTypes = {
   muiTheme: PropTypes.object.isRequired,
}

export default Wail

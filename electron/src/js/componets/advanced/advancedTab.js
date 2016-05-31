import React, {Component, PropTypes} from 'react'
import {Tabs, Tab} from 'material-ui/Tabs'
import General from './general'
import Wayback from './wayback'
import Heritrix from './heritrix/heritrix'
import Miscellaneous from './miscellaneous'

export default class AdvancedTab extends Component {
   constructor(props, context) {
      super(props, context)
      this.state = {key: 'general'}
      this.handleSelect = this.handleSelect.bind(this)
   }
   

   handleSelect(selectedKey) {
      this.setState({key: selectedKey})
   }

   render() {
      return (
         <Tabs
            value={this.state.value}
            onChange={this.handleChange}
         >
            <Tab label="General" value="general">
               <General/>
            </Tab>
            <Tab label="Wayback" value="wayback">
               <Wayback />
            </Tab>
            <Tab label="Heritrix" value="heritrix">
               <Heritrix />
            </Tab>
            <Tab label="Miscellaneous" value="miscellaneous">
               <Miscellaneous />
            </Tab>
         </Tabs>

      )
   }
}
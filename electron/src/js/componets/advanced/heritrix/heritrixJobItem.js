import React, {Component, PropTypes} from 'react'
import {ListItem} from 'material-ui/List'


export default class HeritrixJobItem extends Component {
   
   constructor(props, context) {
      super(props, context)
      this.state = {
         jobID: 0,
         discovered: 0,
         queued: 0,
         downloaded: 0,
         path: "",
      }
   }


   render() {
      return (
            <ListItem primaryText={this.state.jobID}/>
      )
   }
}

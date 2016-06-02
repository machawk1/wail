import React, {Component, PropTypes} from 'react'
import {ListItem} from 'material-ui/List'


export default class HeritrixJobItem extends Component {

   static propTypes = {
      jobId: PropTypes.number.isRequired,
      path: PropTypes.string.isRequired,
   }
   
   constructor(props, context) {
      super(props, context)
      this.state = {
         jobId: this.props.jobId,
         discovered: 0,
         queued: 0,
         downloaded: 0,
         path: this.props.path,
      }
   }


   render() {
      return (
         <ListItem primaryText={this.state.jobId}/>
      )
   }
}

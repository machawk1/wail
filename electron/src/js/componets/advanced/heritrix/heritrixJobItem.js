import React, {Component, PropTypes} from 'react'
import {ListItem} from 'material-ui/List'
import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'

const iconButtonElement = (
   <IconButton
      touch={true}
      tooltip="more"
      tooltipPosition="bottom-left"
   >
      <MoreVertIcon color={grey400}/>
   </IconButton>
)

const rightIconMenu = (
   <IconMenu iconButtonElement={iconButtonElement}>
      <MenuItem>Reply</MenuItem>
      <MenuItem>Forward</MenuItem>
      <MenuItem>Delete</MenuItem>
   </IconMenu>
)

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
         <div>
            <ListItem
               primaryText={this.state.jobId}
               rightIconButton={rightIconMenu}
            />
            <Divider />
         </div>
      )
   }
}

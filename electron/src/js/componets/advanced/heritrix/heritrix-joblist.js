import React, {Component, PropTypes} from 'react'
import {List, ListItem} from 'material-ui/List'


export default class HeritrixJobList extends Component {


   constructor(props, context) {
      super(props, context)
   }


   render() {
      return (
         <List>
            <ListItem primaryText="test1"/>
            <ListItem primaryText="test2"/>
         </List>
      )
   }
}

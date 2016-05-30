import React, {Component, PropTypes} from 'react'
import Paper from 'material-ui/Paper'
import {Row} from 'react-cellblock'


export default class MessagePanel extends Component {
   constructor(props, context) {
      super(props, context)

   }


   render() {
      return (
        
            <Paper zDepth={3}>
               <p>
                  Fetching memento count from public
               </p>
            </Paper>
         
      )
   }
}
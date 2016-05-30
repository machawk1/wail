import React, {Component, PropTypes} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'

const styles = {
   button: {
      margin: 12,
   },
}

export default class General extends Component {
   constructor(props, context) {
      super(props, context)
      this.onClickViewWayback = this.onClickViewWayback.bind(this)
      this.onClickEditWayback = this.onClickEditWayback.bind(this)
   }

   onClickViewWayback(event) {
      console.log('View Wayback')
   }

   onClickEditWayback(event) {
      console.log('Edit Wayback')

   }
   render() {
      return (
         <Paper zdepth={3}>
            <RaisedButton
               label="View Wayback in Browser"
               labelPosition="before"
               primary={true}
               style={styles.button}
               onMouseDown={this.onClickViewWayback}
            />
            <RaisedButton
               label="Edit Wayback Configuration"
               labelPosition="before"
               primary={true}
               style={styles.button}
               onMouseDown={this.onClickEditWayback}
            />
         </Paper>
      )
   }
}

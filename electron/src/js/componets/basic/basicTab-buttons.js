import React, {Component, PropTypes} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {Row} from 'react-cellblock'

const styles = {
   button: {
      margin: 12,
   },
}

export default class BasicTabButtons extends Component {
   constructor(props, context) {
      super(props, context)
      this.onClickArchiveNow = this.onClickArchiveNow.bind(this)
      this.onClickCheckArchive = this.onClickCheckArchive.bind(this)
      this.onClickViewArchive = this.onClickViewArchive.bind(this)
   }

   onClickArchiveNow(event) {
      console.log('archive now')
   }

   onClickCheckArchive(event) {
      console.log('check archive')

   }

   onClickViewArchive(event) {
      console.log('view archive')

   }

   render() {
      return (
        
            <Row>
               <RaisedButton
                  label="Archive Now!"
                  labelPosition="before"
                  primary={true}
                  style={styles.button}
                  onMouseDown={this.onClickArchiveNow}
               />
               <RaisedButton
                  label="Check Archived Status"
                  labelPosition="before"
                  primary={true}
                  style={styles.button}
                  onMouseDown={this.onClickCheckArchive}
               />
               <RaisedButton
                  label="View Archive"
                  labelPosition="before"
                  primary={true}
                  style={styles.button}
                  onMouseDown={this.onClickViewArchive}
               />
            </Row>
      )
   }
}
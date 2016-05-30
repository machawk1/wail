import React, {Component, PropTypes} from 'react'
import ArchiveUrl from './archive-url'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'

const styles = {
    button: {
        margin: 12,
    },
    exampleImageInput: {
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: '100%',
        opacity: 0,
    },
}

export default class Basic extends Component{
   constructor(props, context) {
      super(props, context)
       this.onClick = this.onClick.bind(this)
   }

    onClick(event) {

        console.log(event)
    }
    
   render(){
      console.log("HI hellow")
      console.log("hehehe dasass ")
      console.log("hehehe dasass e ")
      return(
          <div>
             <ArchiveUrl />
              <div>
                  <RaisedButton
                      label="Archive Now!"
                      labelPosition="before"
                      primary={true}
                      style={styles.button}
                  />
                  <RaisedButton
                      label="Check Archived Status"
                      labelPosition="before"
                      primary={true}
                      style={styles.button}
                  />
                  <RaisedButton
                      label="View Archive"
                      labelPosition="before"
                      primary={true}
                      style={styles.button}
                  />
              </div>
          </div>


      )
   }
}


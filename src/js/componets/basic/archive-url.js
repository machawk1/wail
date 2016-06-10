import React, {Component} from "react"
import TextField from "material-ui/TextField"
import {urlUpdated} from "../../actions/archive-url-actions"
import {Row, Column} from "react-cellblock"
import RaisedButton from 'material-ui/RaisedButton'
import {red500, blue500} from "material-ui/styles/colors"
import validator from 'validator'
import * as aua from '../../actions/archive-url-actions'

const styles = {
    underlineStyle: {
        borderColor: blue500,
    },
    underlineStyleError: {
        borderColor: red500,
    },
    button: {
        // padding: '10px',
        right: '0px',
        margin: 12,
    },

}

export default class ArchiveUrl extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { uri: "", underlineStyle: styles.underlineStyle }
        this.handleChange = this.handleChange.bind(this)
        this.focusLost = this.focusLost.bind(this)
        this.attemptMementoGet = this.attemptMementoGet.bind(this)
    }


    handleChange(e) {
        console.log('setState')
        console.log(e.target.value)
        let value = e.target.value
        let err = styles.underlineStyleError
        if (validator.isURL(value)) {
            err = styles.underlineStyle
        }
        this.setState({uri: value, underlineStyle:err})
    }

    attemptMementoGet(){
        if(validator.isURL(this.state.uri)){
            aua.getMementos(this.state.uri)
        }
    }

    focusLost(event) {
        console.log('checking uri for archiving',this.state.uri,event.target.value)
        if (validator.isURL(event.target.value)) {
            console.log("its valid")
            aua.urlUpdated(event.target.value)
        }
    }
    
    

    render() {
        return (
           <Row>
               <TextField
                  floatingLabelText="URL"
                  underlineStyle={this.state.underlineStyle}
                  hintText="http://matkelly.com/wail"
                  id="archive-url-input"
                  value={this.state.uri}
                  onBlur={this.focusLost}
                  onChange={this.handleChange}
               />
               <RaisedButton
                  label="Get Memento Count"
                  onTouchTap={this.attemptMementoGet}
                  style={styles.button}
               />
           </Row>
           

        )
    }
}

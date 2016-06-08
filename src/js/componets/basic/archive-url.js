import React, {Component} from "react"
import TextField from "material-ui/TextField"
import {urlUpdated} from "../../actions/archive-url-actions"
import {Row, Column} from "react-cellblock"
import RaisedButton from 'material-ui/RaisedButton'
import {red500, blue500} from "material-ui/styles/colors"
import validator from 'validator'

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


    focusLost(event) {
        console.log('focus lost',this.state.uri)
        if (validator.isURL(this.state.uri)) {
            urlUpdated(this.state.uri)
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
                  onChange={this.handleChange}
               />
               <RaisedButton
                  label="Get Memento Count"
                  onTouchTap={this.focusLost}
                  style={styles.button}
               />
           </Row>
           

        )
    }
}

/*
 <label for="archive-url-input">URL:   </label>
 <ValidatedInput
 type='text'
 label='Email'
 // Each input that you need validated should have
 // the "name" prop
 name='email'
 // Validation rules separated with comma
 validate='required,isEmail'
 // Error messages for each error type
 errorHelp={{
 required: 'Please enter your email',
 isEmail: 'Email is invalid'
 }}
 />

 */

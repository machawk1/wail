import React, {Component} from "react";
import validUrl from "valid-url";
import TextField from "material-ui/TextField";
import {urlUpdated} from "../../actions/archive-url-actions";
import {Row} from "react-cellblock";
import {red500, blue500} from "material-ui/styles/colors";


const styles = {
    underlineStyle: {
        borderColor: blue500,
    },
    underlineStyleError: {
        borderColor: red500,
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
        if (validUrl.is_web_uri(value) || validUrl.isUri(value)) {
            err = styles.underlineStyle
        }
        this.setState({uri: value, underlineStyle:err})
    }


    focusLost(event) {
        console.log('focus lost',this.state.uri)
        if (validUrl.is_web_uri(this.state.uri) || validUrl.isUri(this.state.uri)) {
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
                  onBlur={this.focusLost}
                  onChange={this.handleChange}
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

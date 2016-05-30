import React, {Component, PropTypes} from 'react'
import validUrl from 'valid-url'
import TextField from 'material-ui/TextField'
import  {urlUpdated} from '../../actions/archive-url-actions'
import {blue500} from 'material-ui/styles/colors'
import {Row} from 'react-cellblock'
import UrlStore from '../../stores/urlStore'


const styles = {
    floatingLabelStyle: {
        color:blue500,
    },
    floatingLabelFocusStyle: {
        color: blue500,
    },
}

export default class ArchiveUrl extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {uri: ' '}
        this.handleChange = this.handleChange.bind(this)
        this.validateUrl = this.validateUrl.bind(this)

    }


    handleChange(e) {
        console.log(e.target.value)
        let value = e.target.value
        if (validUrl.is_web_uri(value)) {
            urlUpdated(value)
        }
        this.setState({uri: value})

    }


    validateUrl() {
        console.log(this.state.uri)
        return validUrl.is_web_uri(this.state.uri)
    }

    render() {
        return (
           <Row>
               <TextField
                  disabled={false}
                  error={false}
                  ref="aui"
                  name="what"
                  floatingLabelText="Enter URL"
                  hintText="http://matkelly.com/wail"
                  id="archive-url-input"
                  floatingLabelFixed={false}
                  value={this.state.uri}
                  onChange={this.handleChange}
               />
           </Row>
           

        )
    }
}

/*
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

import React, {Component, PropTypes} from 'react'
import validUrl from 'valid-url'
import {FormGroup, InputGroup, FormControl} from 'react-bootstrap'
import urlUpdated from '../actions/archive-url-actions'

export default class ArchiveUrl extends Component {
    constructor(props) {
        super(props)
        this.state = {uri: 'http://matkelly.com/wail',validState: true}
        this.unvalidated_state = {uri: 'http://matkelly.com/wail'}
        this.handleChange = this.handleChange.bind(this)
        this.validateUrl = this.validateUrl.bind(this)
        this.validationState = this.validationState.bind(this)
    }


    componentWillMount(){

    }

    handleChange(e) {
        if(validUrl.is_web_uri(e.target.value)){
            let value = e.target.value
            this.setState({uri: value})
            urlUpdated(value)
        }
        this.unvalidated_state.uri = e.target.value

    }

    validationState() {
        if (validUrl.is_web_uri(this.unvalidated_state.uri)) {
            return 'success';
        } else {
            return 'error';
        }

    }

    validateUrl() {
        console.log(this.state.uri)
        return validUrl.is_web_uri(this.state.uri)
    }

    render() {
        return (
            <div className="container-fluid">

                <FormGroup
                    controlId="uri"
                    validationState={this.validationState()}
                >
                <InputGroup>
                    <InputGroup.Addon>URL:</InputGroup.Addon>
                    <FormControl type="text" value={this.state.uri}
                                 placeholder="Enter URL"
                                 onChange={this.handleChange}/>
                    <FormControl.Feedback />
                </InputGroup>
                </FormGroup>
            </div>
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

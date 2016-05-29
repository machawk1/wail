import React, {Component, PropTypes} from 'react'
import validUrl from 'valid-url'
import {Grid, Row, Column} from 'react-cellblock';
import Field from 'react-input-field'
import {Label} from 'react-bootstrap'

export default class ArchiveUrl extends Component{
   constructor(props) {
      super(props)
      this.state = {uri:'http://matkelly.com/wail'}
      this.handleChange = this.handleChange.bind(this)
      this.validateUrl = this.validateUrl.bind(this)
   }

   handleChange(value) {
      if(validUrl.is_web_uri(value))
         this.setState({ uri: value })
   }

   validateUrl(){
      console.log(this.state.uri)
      return validUrl.is_web_uri(this.state.uri)
   }

   render(){
      return(
         <div className="container-fluid">
            <p>URL:</p>
            <Label for="uri-enter">URL:</Label>
            <Field id='uri-enter' onChange={this.handleChange} validate={this.validateUrl} defaultValue={this.state.uri} />
         </div>
      )
   }
}

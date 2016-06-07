import React, {Component, PropTypes} from "react";
import Snackbar from "material-ui/Snackbar";
import TextField from "material-ui/TextField";
import {Row, Column} from "react-cellblock";


export default class CrawlDepth extends Component {
   static propTypes = {
      depthAdded: PropTypes.func.isRequired,
   }

   constructor(props, context) {
      super(props, context)
      this.state = {
         open: false,
         depth: '',
         text: '',
      }
      this.depthCheck = /^[0-9]+$/
      this.checkKeyCode = this.checkKeyCode.bind(this)
      this.handleChange = this.handleChange.bind(this)
      this.handleRequestClose = this.handleRequestClose.bind(this)
   }


   checkKeyCode(event) {
      console.log(event.keyCode)
      let depth = this.state.text
      if (event.keyCode == 13) {
         if (this.depthCheck.test(depth)) {
            console.log("We have a valid depth!")
            this.props.depthAdded(parseInt(depth))
            this.setState({depth: depth, text: ''})
         } else {
            this.setState({
               open: true,
            })
         }

      }

   }

   handleChange(e) {
      console.log(e.target.value)
      this.setState({text: e.target.value})
   }

   handleRequestClose() {
      this.setState({
         open: false,
      });
   }


   render() {
      return (
         <div>
            <Row>
               <Column width="1/2">
                  <TextField
                     floatingLabelText="Enter Crawl Depth"
                     hintText="1"
                     id="crawl-depth-input"
                     value={this.state.text}
                     onKeyDown={this.checkKeyCode}
                     onChange={this.handleChange}
                  />
               </Column>
               <Column width="1/2">
                  <p>{this.state.depth}</p>
               </Column>
               <Snackbar
                  open={this.state.open}
                  message="You entered an invalid crawl depth"
                  autoHideDuration={4000}
                  onRequestClose={this.handleRequestClose}
               />
            </Row>
         </div>
      )
   }
}

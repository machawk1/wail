import React, {Component, PropTypes} from 'react'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import {Grid,Row,Column} from 'react-cellblock'


export default class CrawlUrls extends Component {
   static propTypes = {
      urlAdded: PropTypes.func.isRequired,
   }

   constructor(props, context) {
      super(props, context)
      this.state = {
         open: false,
         urls: [],
         text:'',
      }
      this.handleOpen = this.handleOpen.bind(this)
      this.handleClose = this.handleClose.bind(this)
      this.checkKeyCode = this.checkKeyCode.bind(this)
      this.handleChange = this.handleChange.bind(this)
   }

   handleOpen () {
      this.setState({open: true})
   }

   handleClose() {
      this.setState({open: false})
   }

   checkKeyCode(event){
      console.log(event.keyCode)
      if(event.keyCode == 13){
         let uris = this.state.urls
         uris.push(<ListItem key={uris.length+1} primaryText={this.state.text}/>)
         uris.push(<Divider key={uris.length+1} />)
         console.log("enter")
         this.setState({urls: uris,text:''})
      }

   }

   handleChange(e) {
      console.log(e.target.value)
      this.setState({text: e.target.value})
   }

   buildList(){

   }

   render() {
      return (
        <Grid>
           <Row>
              <Column width="1/2">
                 <TextField
                    floatingLabelText="Enter URI to crawl"
                    hintText="http://matkelly.com/wail"
                    id="url-input"
                    value={this.state.text}
                    onKeyDown={this.checkKeyCode}
                    onChange={this.handleChange}
                 />
                 </Column>
              <Column width="1/2">
                 <List style={{height:"200px",overflowX: "hidden","overflowY": "scroll"}} children={ this.state.urls }/>
              </Column>

              </Row>

        </Grid>
      )
   }
}

import React, {Component, PropTypes} from "react"
import {List} from "material-ui/List"
import Divider from "material-ui/Divider"
import TextField from "material-ui/TextField"
import {Grid, Row, Column} from "react-cellblock"
import _ from "lodash"
import CrawlUrlItem from "./crawlUrlItem"

const style = {
   height: "100px",
   overflowX: "hidden",
   "overflowY": "scroll"
}


export default class CrawlUrls extends Component {
   static propTypes = {
      urlAdded: PropTypes.func.isRequired,
   }

   constructor(props, context) {
      super(props, context)
      this.state = {
         open: false,
         urls: [],
         text: '',
         keys: 0,
      }
      this.handleOpen = this.handleOpen.bind(this)
      this.handleClose = this.handleClose.bind(this)
      this.checkKeyCode = this.checkKeyCode.bind(this)
      this.handleChange = this.handleChange.bind(this)
   }

   handleOpen(event) {
      this.setState({open: true})
   }

   handleClose(event) {
      this.setState({open: false})
   }


   checkKeyCode(event) {
      console.log(event.keyCode)
      if (event.keyCode == 13) {
         let uris = this.state.urls
         let keyNum = this.state.keys
         let text = this.state.text


         let deleteAction = (event) => {
            let list = this.state.urls
            let removeUrl = ""
            // list.forEach(elem => console.log(elem))
            let newUrls = _.remove(list, elem => parseInt(elem.key) != keyNum)
            // this.state.urls.
            this.setState({urls: newUrls})
         }
         deleteAction = deleteAction.bind(this)


         uris.push(
            <CrawlUrlItem
               textChanged={this.props.urlAdded}
               idx={uris.length}
               id={keyNum}
               num={keyNum}
               key={keyNum}
               deleteMe={deleteAction}
               url={text}
            />
         )
         uris.push(<Divider key={keyNum+3}/>)
         this.props.urlAdded(this.state.text)
         this.setState({urls: uris, text: '', keys: keyNum + 4})
      }

   }

   handleChange(e) {
      this.setState({text: e.target.value})
   }


   render() {

      return (

         <Row>
            <Column width="1/2">
               <TextField
                  floatingLabelText="Enter URI to crawl"
                  hintText="http://matkelly.com/wail"
                  id="crawl-url-input"
                  value={this.state.text}
                  tooltip="press enter"
                  onKeyDown={this.checkKeyCode}
                  onChange={this.handleChange}
               />
            </Column>
            <Column width="1/2">
               <List style={style} children={ this.state.urls }/>
            </Column>
         </Row>
      )
   }
}

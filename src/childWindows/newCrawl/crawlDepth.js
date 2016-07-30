import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import {Row, Column} from 'react-cellblock'
import style from '../../componets/styles/styles'
import CrawlUrlsDispatcher from './crawlUrlsDispatcher'
import wailConstants from '../../constants/wail-constants'

const EventTypes = wailConstants.EventTypes
const items = [];
for (let i = 1; i <= 10; i++) {
  items.push(<MenuItem value={i} key={i} primaryText={`${i}`}/>)
}

export default class CrawlDepth extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      value: 1
    }
  }

  @autobind
  handleChange (event, index, value) {
    this.setState({ value })
    CrawlUrlsDispatcher.dispatch({
      type: EventTypes.NEW_CRAWL_ADD_DEPTH,
      depth: parseInt(value)
    })
  }

  // @autobind
  // checkKeyCode (event) {
  //   let depth = this.state.text
  //   if (event.keyCode === 13) {
  //     if (this.depthCheck.test(depth)) {
  //       console.log('We have a valid depth!')
  //       CrawlUrlsDispatcher.dispatch({
  //         type: EventTypes.NEW_CRAWL_ADD_DEPTH,
  //         depth: parseInt(depth)
  //       })
  //       this.setState({ depth: depth, text: '' })
  //     } else {
  //       this.setState({
  //         open: true
  //       })
  //     }
  //   }
  // }

  // @autobind
  // addDepth (e) {
  //   let depth = this.state.text
  //   if (this.depthCheck.test(depth)) {
  //     console.log('We have a valid depth!')
  //     CrawlUrlsDispatcher.dispatch({
  //       type: EventTypes.NEW_CRAWL_ADD_DEPTH,
  //       depth: parseInt(depth)
  //     })
  //     this.setState({ depth: depth, text: '' })
  //   } else {
  //     this.setState({
  //       open: true
  //     })
  //   }
  // }

  // @autobind
  // handleChange (e) {
  //   console.log(e.target.value)
  //   this.setState({ text: e.target.value })
  // }
  //
  // @autobind
  // handleRequestClose () {
  //   this.setState({
  //     open: false
  //   })
  // }

  render () {
    return (
        <SelectField
          value={this.state.value}
          onChange={this.handleChange}
          children={items}
          floatingLabelText="Crawl Depth"
        />
    )
  }
}

/*
 {<p style={style.cursor}>{this.state.depth}</p>}
 <Column width="3/4">
 <TextField
 floatingLabelText="Enter Crawl Depth"
 hintText="1"
 id="crawl-depth-input"
 value={this.state.text}
 onKeyDown={this.checkKeyCode}
 onChange={this.handleChange}
 />
 </Column>
 <Column width="1/4">
 <RaisedButton label="Add Depth" style={style.button} onMouseDown={this.addDepth}/>
 </Column>
 <Snackbar
 open={this.state.open}
 message="You entered an invalid crawl depth"
 autoHideDuration={4000}
 onRequestClose={this.handleRequestClose}
 />
 */
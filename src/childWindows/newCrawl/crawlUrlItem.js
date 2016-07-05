import React, { Component, PropTypes } from "react"
import autobind from 'autobind-decorator'
import { ListItem } from "material-ui/List"
import TextField from "material-ui/TextField"
import { grey400 } from "material-ui/styles/colors"
import IconButton from "material-ui/IconButton"
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert"
import IconMenu from "material-ui/IconMenu"
import MenuItem from "material-ui/MenuItem"

const style = {
  height: "100px",
  overflowX: "hidden",
  "overflowY": "scroll"
}

export default class CrawlUrlItem extends Component {
  static propTypes = {
    deleteMe: PropTypes.func.isRequired,
    textChanged: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    idx: PropTypes.number.isRequired,
    num: PropTypes.number.isRequired,
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      url: this.props.url,
      editable: false
    }
    
  }

  @autobind
  editCrawlUrl (event) {
    if (!this.state.editable)
      this.setState({ editable: true })

  }

  @autobind
  checkKeyCode (event) {
    if (event.keyCode == 13) {
      if (this.state.editable) {
        this.setState({ editable: false })
        console.log(this.state.url, this.props.idx)
        this.props.textChanged({ url: this.state.url, edit: this.props.idx })
      }
    }
  }

  @autobind
  handleChange (e) {
    console.log(e.target.value)
    this.setState({ url: e.target.value })
  }

  render () {
    const rightIconMenu = (
      <IconMenu iconButtonElement={<MoreVertIcon color={grey400}/>}>
        <MenuItem onTouchTap={this.editCrawlUrl}>Edit</MenuItem>
        <MenuItem onTouchTap={this.props.deleteMe}>Delete</MenuItem>
      </IconMenu>
    )
    const editUrlInList = (
      <TextField
        disabled={!this.state.editable}
        underlineShow={false}
        onChange={this.handleChange}
        onKeyDown={this.checkKeyCode}
        id={this.state.url}
        value={this.state.url}
        key={this.props.num+2}
      />
    )
    return (
      <ListItem
        key={this.props.num}
        primaryText={editUrlInList}
        rightIconButton={rightIconMenu}
      />
    )
  }
}

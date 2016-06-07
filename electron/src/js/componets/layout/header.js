import React, {Component} from "react";
import AppBar from "material-ui/AppBar";
import Drawer from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";
import {zIndex} from "material-ui/styles";
import {Link, IndexLink} from "react-router";

const style = {
   appBar: {
      position: 'fixed',
      // Needed to overlap the examples
      zIndex: zIndex.appBar + 1,
      top: 0,
   },
   navDrawer: {
      zIndex: zIndex.appBar - 1,
   }
}
export default class Header extends Component {
   constructor(props, context) {
      super(props, context)
      this.state = {open: false}
      this.handleToggle = this.handleToggle.bind(this)
      this.handleClose = this.handleClose.bind(this)
   }

   handleToggle() {
      if (!this.state.open)
         console.log('we are opening the drawer')
      this.setState({open: !this.state.open})
   }

   handleClose() {
      this.setState({open: false})
   }

   render() {
      return (
         <div>
            <AppBar
               title="Wail"
               onLeftIconButtonTouchTap={this.handleToggle}
               iconClassNameRight="muidocs-icon-navigation-expand-more"
            />
            <Drawer
               docked={false}
               width={200}
               open={this.state.open}
               onRequestChange={(open) => this.setState({open})}
            >
               <MenuItem
                  primaryText={"Basic"}
                  containerElement={<IndexLink to="/" />}
                  onTouchTap={this.handleClose}/>
               <MenuItem
                  primaryText={"Advanced"}
                  containerElement={<Link to="advanced" />}
                  onTouchTap={this.handleClose}/>
            </Drawer>
         </div>

      )
   }
}



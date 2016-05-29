import React, {Component, PropTypes} from 'react'
import {Tab, Nav, Navbar, NavItem, Image} from 'react-bootstrap'
import Basic from './basic'


export default class Wail extends Component {
   constructor(props) {
      super(props)
      this.state = {key: 1}
      this.handleSelect = this.handleSelect.bind(this)
   }

   handleSelect(selectedKey) {
      this.setState({key: selectedKey})
   }

   render() {
      console.log("HI hellow")
      console.log("hehehe dasass ")
      console.log("hehehe dasass e ")
      return (
         <Tab.Container id="theTabs" onSelect={this.handleSelect} activeKey={this.state.key}>
            <div>
               <Nav bsStyle="tabs" justified pullLeft>
                  <NavItem eventKey={1}>Basic</NavItem>
                  <NavItem eventKey={2}>Advanced</NavItem>
               </Nav>
               <Tab.Content animation>
                  <Tab.Pane animation eventKey={1}>
                   <Basic />
                  </Tab.Pane>
                  <Tab.Pane animation eventKey={2}>
                     <p>HI</p>
                  </Tab.Pane>
               </Tab.Content>
            </div>
         </Tab.Container>
      )
   }
}


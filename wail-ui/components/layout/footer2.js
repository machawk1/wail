import React, {Component} from 'react'
import FontIcon from 'material-ui/FontIcon'
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar'
import IconLocationOn from 'material-ui/svg-icons/communication/location-on'

const recentsIcon = <FontIcon className='material-icons'>restore</FontIcon>
const favoritesIcon = <FontIcon className='material-icons'>favorite</FontIcon>
const nearbyIcon = <IconLocationOn />

export default class Footer2 extends Component {
  state = {
    selectedIndex: 0
  }
  select = (index) => this.setState({selectedIndex: index})
  render () {
    return (
      <Toolbar className='layoutFooter'>
        <ToolbarGroup firstChild>
          <p>
            me
          </p>
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <ToolbarTitle text='WSDL@ODU' />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}


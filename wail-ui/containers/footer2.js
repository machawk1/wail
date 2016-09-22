import React, {Component} from 'react'
import FontIcon from 'material-ui/FontIcon'
import {Grid, Row, Col} from 'react-flexbox-grid'
import Notifications from '../informational/notifications'
import StatusDialog from '../informational/statusDialog'
import BottomNav from './bottomNav'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation'
import Paper from 'material-ui/Paper'
import IconLocationOn from 'material-ui/svg-icons/communication/location-on'

const recentsIcon = <FontIcon className="material-icons">restore</FontIcon>
const favoritesIcon = <FontIcon className="material-icons">favorite</FontIcon>
const nearbyIcon = <IconLocationOn />

export default class Footer2 extends Component {
  state = {
    selectedIndex: 0,
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
          <ToolbarTitle text='WSDL@ODU'/>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}



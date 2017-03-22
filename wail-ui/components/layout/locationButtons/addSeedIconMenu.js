import React, { Component, PropTypes } from 'react'
import FlatButton from 'material-ui/FlatButton'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover'
import {Link} from 'react-router-dom'
import { amber500 } from 'material-ui/styles/colors'
import { dynamicRouteResolvers as drr } from '../../../routes/routeNames'
import changeLocation from '../../../actions/changeLocation'

class AddSeedIconMenu extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {open: false}
    this.linkStyle = {
      color: this.context.muiTheme.baseTheme.palette.primary1Color,
      textDecoration: 'none'
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.state.open !== nextState.open || this.props.match.col !== nextProps.match.col
  }

  handleOpenMenu (event) {
    event.preventDefault()
    this.setState({open: true, anchorEl: event.currentTarget,})
  }

  close () {
    this.setState({open: false})
  }

  goToAddSeed () {
    const {match} = this.props
    const {store} = this.context
    this.setState({open: false}, () => {
      store.dispatch(changeLocation(drr.addSeed(match.params.col)))
    })
  }

  goToAddSeedFs () {
    const {match} = this.props
    const {store} = this.context
    this.setState({open: false}, () => {
      store.dispatch(changeLocation(drr.addSeedFs(match.params.col)))
    })
  }

  render () {
    const {match} = this.props
    return (
      <div>
        <FlatButton label='Add Seed' labelStyle={{color: amber500}} onTouchTap={::this.handleOpenMenu}/>
        <Popover
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          open={this.state.open}
          onRequestClose={::this.close}
        >
          <Link style={this.linkStyle} to={drr.addSeed(match.params.col)} onClick={::this.close}>
            <MenuItem
              style={{color: this.context.muiTheme.baseTheme.palette.primary1Color}}
              primaryText={'From Live Web'}
            />
          </Link>
          <Link style={this.linkStyle} to={drr.addSeedFs(match.params.col)} onClick={::this.close}>
            <MenuItem
              style={{color: this.context.muiTheme.baseTheme.palette.primary1Color}}
              primaryText='From File System'
            />
          </Link>
        </Popover>
      </div>
    )
  }
}

export default AddSeedIconMenu

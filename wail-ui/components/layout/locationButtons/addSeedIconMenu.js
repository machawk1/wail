import React, { Component, PropTypes } from 'react'
import FlatButton from 'material-ui/FlatButton'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover'
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

  closeGoTo (to) {
    this.setState({open: false}, () => {
      changeLocation(to)
    })
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
    return (
      <div>
        <FlatButton label='Add Seed' labelStyle={{color: amber500}} onTouchTap={::this.handleOpenMenu}/>
        <Popover
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          open={this.state.open}
          onRequestClose={::this.close}
          onMouseLeave={(...args) => {console.log('mouse leave popover', args)}}
        >
          <MenuItem
            onTouchTap={::this.goToAddSeed}
            style={{color: this.context.muiTheme.baseTheme.palette.primary1Color}}
            primaryText={'From Live Web'}
          />
          <MenuItem
            onTouchTap={::this.goToAddSeedFs}
            style={{color: this.context.muiTheme.baseTheme.palette.primary1Color}}
            primaryText='From File System'
          />
        </Popover>
      </div>
    )
  }
}

export default AddSeedIconMenu

import React, { PropTypes } from 'react'
import AppBar from 'material-ui/AppBar'

const style = {marginTop: 0, paddingBottom: 0, paddingTop: 0, height: 55}
const withLineHeight = {...style, lineHeight: '55px'}

const DynamicAppBar = ({leftIconTouchTap, Location, IconRight}) => (
  <AppBar
    id='wailAppBar'
    style={style}
    titleStyle={withLineHeight}
    iconStyleLeft={style}
    iconStyleRight={withLineHeight}
    title={Location}
    onLeftIconButtonTouchTap={leftIconTouchTap}
    iconElementRight={IconRight}
  />
)

DynamicAppBar.propTypes = {
  leftIconTouchTap: PropTypes.func.isRequired,
  Location: PropTypes.element.isRequired,
  IconRight: PropTypes.element.isRequired
}

export default DynamicAppBar

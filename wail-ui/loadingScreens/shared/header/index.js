import React, {PropTypes} from 'react'
import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys'

const enhance = onlyUpdateForKeys(['title'])

const Header = ({title}) => (
  <AppBar
    iconElementLeft={<Avatar className='img-circle' backgroundColor={'transparent'} src={'icons/whale.ico'}/>}
    title={title}
  />
)

Header.propTypes = {
  title: PropTypes.string.isRequired
}

export default enhance(Header)
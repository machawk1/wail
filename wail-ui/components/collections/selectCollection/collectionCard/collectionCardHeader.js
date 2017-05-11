import React from 'react'
import PropTypes from 'prop-types'
import CardTitle from 'material-ui/Card/CardTitle'
import { amber500 } from 'material-ui/styles/colors'
import { Link } from 'react-router-dom'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import { dynamicRouteResolvers as drr } from '../../../../routes/routeNames'
const linkStyle = {color: amber500, textDecoration: 'none', textAlign: 'center'}

const enhance = namedUpdateKeys('CollectionCardHeader', ['name', 'i'])

const CollectionCardHeader = ({name, i}, {muiTheme: {baseTheme: {palette: {primary1Color}}}}) => (
  <CardTitle
    key={`CollectionCardHeader-${name}`}
    style={{backgroundColor: primary1Color, marginTop: 0, marginBottom: 0, padding: 10}}
    title={<Link id={`colto${i}`} to={drr.viewCollection(name)} style={linkStyle}>{name}</Link>}
  />
)

CollectionCardHeader.propTypes = {
  name: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired
}

CollectionCardHeader.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

export default enhance(CollectionCardHeader)

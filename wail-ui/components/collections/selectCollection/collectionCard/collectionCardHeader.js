import React, { PropTypes } from 'react'
import CardTitle from 'material-ui/Card/CardTitle'
import { amber500 } from 'material-ui/styles/colors'
import { Link } from 'react-router-dom'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import { dynamicRouteResolvers as drr } from '../../../../routes/routeNames'
const linkStyle = {color: amber500, textDecoration: 'none'}

const enhance = namedUpdateKeys('CollectionCardHeader', ['name'])

const CollectionCardHeader = ({name}, {muiTheme:{baseTheme:{palette:{primary1Color}}}}) => (
  <CardTitle
    key={`CollectionCardHeader-${name}`}
    style={{backgroundColor: primary1Color, marginTop: 0, marginBottom: 10}}
    title={<Link to={drr.viewCollection(name)} style={linkStyle}>{name}</Link>}
  />
)

CollectionCardHeader.propTypes = {
  name: PropTypes.string.isRequired,
}

CollectionCardHeader.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

export default enhance(CollectionCardHeader)

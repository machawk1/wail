import React, { PropTypes } from 'react'
import { Link } from 'react-router-dom'
import Card from 'material-ui/Card/Card'
import CardTitle from 'material-ui/Card/CardTitle'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import { dynamicRouteResolvers as drr } from '../../../../routes/routeNames'

const enhance = namedUpdateKeys('MementoCardEmpty',['viewingCol'])

const MementoCardEmpty = ({ viewingCol }) => (
  <Link style={{textDecoration: 'none'}} to={drr.addSeed(viewingCol)}>
    <Card key={'noMementos-card'}>
      <CardTitle
        key={'noMementos-card-title'}
        title='No Seeds In Collection. Click Here To Add One'
      />
    </Card>
  </Link>
)

MementoCardEmpty.propTypes = {
  viewingCol: PropTypes.string.isRequired,
}

export default enhance(MementoCardEmpty)
import React from 'react'
import PropTypes from 'prop-types'
import FlatButton from 'material-ui/FlatButton'
import CardActions from 'material-ui/Card/CardActions'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'

const enhance = namedUpdateKeys('MementoCardActions', ['url', 'viewingCol', 'openInWb'])

const MementoCardActions = ({url, viewingCol, openInWb}) => (
  <CardActions key={`MementoCardActions-${url}-${viewingCol}`}>
    <FlatButton
      primary key={`MementoCardActions-${url}-${viewingCol}-viewInWB`}
      label={'View In Wayback'}
      onTouchTap={openInWb}
    />
  </CardActions>
)

MementoCardActions.propTypes = {
  url: PropTypes.string.isRequired,
  viewingCol: PropTypes.string.isRequired,
  openInWb: PropTypes.func.isRequired
}

export default enhance(MementoCardActions)

import PropTypes from 'prop-types'
import React from 'react'
import CardActions from 'material-ui/Card/CardActions'
import FlatButton from 'material-ui/FlatButton'
import SeedFormEntry from './seedFormEntry'
import { addToCollection } from '../../../../constants/uiStrings'

const SeedListFormPage = (props) => {
  const {handleSubmit, pristine, invalid, reset, submitting, containerName, seedName, onSubmit, warcSeeds} = props
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{height: 'inherit'}}
    >
      <SeedFormEntry
        containerName={containerName}
        seeds={warcSeeds}
        name={seedName}
      />
      <CardActions>
        <FlatButton
          label={addToCollection.addWarcOrArcSeedsButton}
          type='submit'
          disabled={invalid || pristine || submitting}
        />
      </CardActions>
    </form>
  )
}

SeedListFormPage.propTypes = {
  containerName: PropTypes.string.isRequired,
  seedName: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  warcSeeds: PropTypes.array.isRequired
}

export default SeedListFormPage

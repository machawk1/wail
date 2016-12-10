import React, { PropTypes } from 'react'
import { CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import MyAutoSizer from '../../../utilComponents/myAutoSizer'
import SeedFormEntry from './seedFormEntry'

const SeedListFormPage = ({containerName, seedName, onSubmit,  warcSeeds}) => (
  <form
    onSubmit={onSubmit}
    style={{height: 'inherit'}}
  >
    <MyAutoSizer findElement={containerName}>
      {
        ({height}) => (
          <SeedFormEntry
            height={height}
            onSubmit={onSubmit}
            seeds={warcSeeds}
            name={seedName}
          />
        )
      }
    </MyAutoSizer>
    <CardActions>
      <FlatButton
        label='Add (W)arc Seed(s)'
        primary
        type='submit'
      />
    </CardActions>
  </form>
)

SeedListFormPage.propTypes = {
  containerName: PropTypes.string.isRequired,
  seedName: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  warcSeeds: PropTypes.array.isRequired
}

export default SeedListFormPage


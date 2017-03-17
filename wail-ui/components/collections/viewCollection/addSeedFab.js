import React, { PropTypes } from 'react'
import { Link } from 'react-router-dom'
import Add from 'material-ui/svg-icons/content/add'
import FloatingActionButton from 'material-ui/FloatingActionButton'

const AddSeedFab = ({viewingCol, fabStyle}) => (
  <Link to={`/addSeed/${viewingCol}`}>
    <FloatingActionButton id='addSeedFab' style={fabStyle}>
      <Add />
    </FloatingActionButton>
  </Link>
)

AddSeedFab.propTypes = {
  viewingCol: PropTypes.string.isRequired,
  fabStyle: PropTypes.object
}

AddSeedFab.defaultProps = {
  fabStyle: {
    right: 0,
    position: 'fixed',
    bottom: 5
  }
}

export default AddSeedFab

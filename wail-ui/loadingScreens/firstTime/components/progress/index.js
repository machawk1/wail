import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, onlyUpdateForKeys } from 'recompose'
import { connect } from 'react-redux'
import CardMedia from 'material-ui/Card/CardMedia'
import CardText from 'material-ui/Card/CardText'
import ProgressSteps from './progressSteps'
import ProgressMessage from './progressMessage'

const stateToProps = state => ({
  step: state.get('loadingStep')
})

const enhance = compose(setDisplayName('Progress'), onlyUpdateForKeys(['step']))

const Progress = ({step}) => (
  <div>
    <CardMedia>
      <ProgressSteps step={step} />
    </CardMedia>
    <CardText>
      <ProgressMessage step={step} />
    </CardText>
  </div>
)

Progress.propTypes = {
  step: PropTypes.number.isRequired
}

export default connect(stateToProps)(enhance(Progress))

import React, { PropTypes } from 'react'
import { onlyUpdateForKeys } from 'recompose'
import { connect } from 'react-redux'
import { CardMedia, CardText } from 'material-ui/Card'
import ProgressSteps from './progressSteps'
import ProgressMessage from './progressMessage'

const stateToProps = state => ({
  step: state.get('loadingStep')
})

const enhance = onlyUpdateForKeys(['step'])

const Progress = ({step}) => (
  <div>
    <CardMedia>
      <ProgressSteps step={step}/>
    </CardMedia>
    <CardText>
      <ProgressMessage step={step}/>
    </CardText>
  </div>
)

Progress.propTypes = {
  step: PropTypes.number.isRequired
}

export default connect(stateToProps)(enhance(Progress))

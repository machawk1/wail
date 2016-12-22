import React, { PropTypes } from 'react'

const getStyles = (last, context) => {
  const styles = {
    root: {
      marginTop: -14,
      marginLeft: 14 + 11, // padding + 1/2 icon
      paddingLeft: 24 - 11 + 8,
      paddingRight: 16,
      overflow: 'hidden',
    },
  }
  if (!last) {
    styles.root.borderLeft = `1px solid ${context.muiTheme.stepper.connectorLineColor}`
  }
  return styles
}

const CheckStepContent = ({last, children}, context) => {
  const {muiTheme: {prepareStyles}} = context
  const styles = getStyles(last, context)
  return (
    <div style={prepareStyles(styles.root)}>
      <div style={{overflow: 'hidden'}}>
        {children}
      </div>
    </div>
  )
}

CheckStepContent.contextTypes = {
  muiTheme: PropTypes.object.isRequired,
  stepper: PropTypes.object,
}

export default CheckStepContent
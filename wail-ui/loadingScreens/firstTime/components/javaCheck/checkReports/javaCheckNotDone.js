import React from 'react'
import { branch, renderComponent } from 'recompose'
import { CheckStepContent } from '../../../../shared/checkStepContents'

const JavaCheckNotDoneDarwin = () => (
  <CheckStepContent>
    <p>
      Usage of Heritrix on MacOS <br />
      Requires JDK 1.7 to be installed
    </p>
  </CheckStepContent>
)

const displayWhich = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(JavaCheckNotDoneDarwin)
  )

const enhance = displayWhich(props => process.platform === 'darwin')

const JavaCheckNotDone = enhance(() => (
  <CheckStepContent>
    <p>Heritrix Requires Java For Usage</p>
  </CheckStepContent>
))

export default JavaCheckNotDone

import React, { PropTypes } from 'react'
import { compose, branch, shouldUpdate, renderComponent, setDisplayName } from 'recompose'
import { JavaCheckRecord, JdkDlRecord } from '../../../records'
import { NotJStepOrIs, JavaCheckDone }  from './checkReports'

const displayWhich = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(NotJStepOrIs)
  )

const updateWhen = (props, nextProps) => props.step === 1 || nextProps.step === 1

const enhance = compose(
  setDisplayName('JavaCheckContents'),
  shouldUpdate(updateWhen),
  displayWhich(props => !props.javaCheckRec.get('checkDone') && props.step <= 1)
)

const JavaCheckContents = enhance(({step, javaCheckRec, jdkDlRec}) => (
  <JavaCheckDone javaCheckRec={javaCheckRec}/>
))

JavaCheckContents.propTypes = {
  step: PropTypes.number.isRequired,
  javaCheckRec: PropTypes.instanceOf(JavaCheckRecord).isRequired,
  jdkDlRec: PropTypes.instanceOf(JdkDlRecord).isRequired
}

export default JavaCheckContents
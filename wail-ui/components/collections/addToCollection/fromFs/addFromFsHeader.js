import React from 'react'
import CardTitle from 'material-ui/Card/CardTitle'
import { namedPure } from '../../../../util/recomposeHelpers'
import acronmys from '../../../../constants/acronyms'

const enhance = namedPure('AddFromFSHeader')

const AddFromFSHeader = () => (
  <CardTitle title={`Drag and Drop ${acronmys.warcOrArc} Here To Add Them To This Collection`} />
)

export default enhance(AddFromFSHeader)

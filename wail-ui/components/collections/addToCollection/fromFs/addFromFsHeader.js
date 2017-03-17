import React from 'react'
import CardTitle from 'material-ui/Card/CardTitle'
import { namedPure } from '../../../../util/recomposeHelpers'

const enhance = namedPure('AddFromFSHeader')

const AddFromFSHeader = () => (
  <CardTitle title='Drag and Drop (W)arcs here to add them to this collection'/>
)

export default enhance(AddFromFSHeader)

import React, {Component} from 'react'
import {Grid} from 'react-cellblock'
import ArchiveUrl from './archive-url'
import BasicTabButtons from './basicTab-buttons'
import MementoMessagePanel from './mementoMessage-panel'

export default class BasicTab extends Component {
  render () {
    return (
      <Grid flexible={true}>
        <ArchiveUrl />
        <MementoMessagePanel />
        <BasicTabButtons />
      </Grid>
    )
  }
}


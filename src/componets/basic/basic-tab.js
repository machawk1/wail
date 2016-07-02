import React, { Component } from "react"
import { Grid , Row} from "react-cellblock"
import ArchiveUrl from "./archive-url"
import BasicTabButtons from "./basicTab-buttons"
import MessagePanel from "./message-panel"

export default class BasicTab extends Component {
  constructor (props, context) {
    super(props, context)
  }
  render () {
    return (
      <div>
        <Grid flexible={true}>
          <ArchiveUrl />
          <MessagePanel />
        </Grid>
        <BasicTabButtons />
      </div>
    )
  }
}


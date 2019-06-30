import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import FlatButton from 'material-ui/FlatButton'
import ViewWatcher from '../../../../wail-core/util/viewWatcher'
import CardTitle from 'material-ui/Card/CardTitle'

const SelectColHeader = () => (
  <Flexbox
    flexDirection='row'
    flexWrap='wrap'
    alignItems='center'
    justifyContent='space-between'
  >
    <CardTitle
      title='Collections'
    />
    <FlatButton
      id='newColButton'
      primary
      label='New Collection'
      onTouchTap={() => ViewWatcher.createCollection()}
    />
  </Flexbox>
)

export default SelectColHeader

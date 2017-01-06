import React, { Component, PropTypes } from 'react'
import { Flex, Item } from 'react-flex'
import FlatButton from 'material-ui/FlatButton'
import ViewWatcher from '../../../../wail-core/util/viewWatcher'
import CardTitle from 'material-ui/Card/CardTitle'

const SelectColHeader = () => (
  <Flex row alignItems='center' justifyContent='space-between'>
    <CardTitle
      title='Collections'
    />
    <FlatButton
      id='newColButton'
      primary
      label='New Collection'
      onTouchTap={() => ViewWatcher.createCollection()}
    />
  </Flex>
)

export default SelectColHeader

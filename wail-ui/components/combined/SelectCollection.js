import React, {Component, PropTypes} from 'react'
import {Flex, Item} from 'react-flex'
import FlatButton from 'material-ui/FlatButton'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import CardTitle from 'material-ui/Card/CardTitle'

const SelectCollection = ({ location, params, route }) => {
  console.log('head', location, params, route)
  return (
    <Flex row alignItems='center' justifyContent='space-between'>
      <CardTitle
        title={location.pathname}
      />
      <FlatButton primary label='New Collection' onTouchTap={() => ViewWatcher.createCollection()}/>
    </Flex>
  )
}

SelectCollection.propTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  route: PropTypes.any
}

export default SelectCollection



import React, { PropTypes } from 'react'
import { Flex } from 'react-flex'
import FlatButton from 'material-ui/FlatButton'
import pure from 'recompose/pure'
import { amber500 } from 'material-ui/styles/colors'
import ViewWatcher from '../../../../wail-core/util/viewWatcher'

const SelectCollectionButtons = ({CrawlIndicator}) => {
  return (
    <Flex row alignItems='center' justifyContent='space-between'>
      {CrawlIndicator}
      <FlatButton
        id='newColButton'
        labelStyle={{color: amber500}}
        label='New Collection'
        onTouchTap={() => {
          ViewWatcher.createCollection()
        }}
      />
    </Flex>
  )
}

SelectCollectionButtons.propTypes = {
  CrawlIndicator: PropTypes.element.isRequired
}

export default pure(SelectCollectionButtons)

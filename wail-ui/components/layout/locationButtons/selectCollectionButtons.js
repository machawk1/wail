import React from 'react'
import PropTypes from 'prop-types'
import Flexbox from 'flexbox-react'
import FlatButton from 'material-ui/FlatButton'
import pure from 'recompose/pure'
import { amber500 } from 'material-ui/styles/colors'
import ViewWatcher from '../../../../wail-core/util/viewWatcher'
import {general} from '../../../constants/uiStrings'

const SelectCollectionButtons = ({CrawlIndicator}) => {
  return (
    <Flexbox
      flexDirection='row'
      flexWrap='wrap'
      alignItems='center'
      justifyContent='space-between'
    >
      {CrawlIndicator}
      <FlatButton
        id='newColButton'
        labelStyle={{color: amber500}}
        label={general.newCol}
        onTouchTap={ViewWatcher.createCollection.bind(ViewWatcher)}
      />
    </Flexbox>
  )
}

SelectCollectionButtons.propTypes = {
  CrawlIndicator: PropTypes.element.isRequired
}

export default pure(SelectCollectionButtons)

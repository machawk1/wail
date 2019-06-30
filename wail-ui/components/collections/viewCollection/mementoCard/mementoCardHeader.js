import React from 'react'
import PropTypes from 'prop-types'
import CardTitle from 'material-ui/Card/CardTitle'
import { fullWhite, amber500 } from 'material-ui/styles/colors'
import Flexbox from 'flexbox-react'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'

const enhance = namedUpdateKeys('MementoCardHeader', ['url', 'lastUpdated'])

const MementoCardHeader = ({lastUpdated, added, url}, {muiTheme: {baseTheme: {palette: {primary1Color}}}}) => (
  <CardTitle
    key={`mementoCardHeader-${lastUpdated}-${url}`}
    style={{backgroundColor: primary1Color, paddingTop: 0, paddingBottom: 10}}
    titleStyle={{fontSize: '15px', color: fullWhite, texOverflow: 'ellipsis'}}
    title={url}
    subtitle={
      <Flexbox
        flexDirection='row'
        flexWrap='wrap'
        justifyContent='space-between'
      >
        <span style={{color: fullWhite}}>Last Archived: {lastUpdated}</span>
        <span style={{color: fullWhite}}>Added: {added}</span>
      </Flexbox>
    }
  />
)

MementoCardHeader.propTypes = {
  lastUpdated: PropTypes.string,
  added: PropTypes.string,
  url: PropTypes.string
}

MementoCardHeader.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

export default enhance(MementoCardHeader)

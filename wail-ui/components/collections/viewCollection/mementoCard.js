import React, { PropTypes } from 'react'
import { Card, CardActions, CardHeader, CardTitle } from 'material-ui/Card'
import { shell, remote } from 'electron'
import { Map } from 'immutable'
import { Flex } from 'react-flex'
import FlatButton from 'material-ui/FlatButton'
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys'

const wbUrl = remote.getGlobal('settings').get('pywb.url')
const openInWb = (seed, forCol) => {
  shell.openExternal(`${wbUrl}${forCol}/*/${seed}`)
}

const MementoCard = ({mckey, seed, url, viewingCol, conf}) => (
  <Card key={mckey} style={{marginTop: 10, marginBottom: 10}}>
    <CardTitle key={`${mckey}-head`} title={url} titleStyle={{fontSize: '18px'}}
               subtitle={`Last Updated: ${seed.get('lastUpdated').format('MMM DD, YYYY h:mma')}`}/>
    <Flex key={`${mckey}-flex`} row alignItems='baseline' justifyContent='space-between'>
      <div key={`${mckey}-d1`}>
        <CardHeader key={`${mckey}-added`} title={`Added: ${seed.get('added').format('MMM DD, YYYY h:mma')}`}/>
        <CardHeader key={`${mckey}-mementos`} title={`Mementos: ${seed.get('mementos')}`}/>
      </div>
      <CardHeader key={`${mckey}-confTitle`} title='Archive Configuration' subtitle={conf}/>
    </Flex>
    <CardActions key={`${mckey}-viewInWB-a`}>
      <FlatButton primary key={`${mckey}-viewInWB`} label={'View In Wayback'}
                  onTouchTap={() => openInWb(url, viewingCol)}/>
    </CardActions>
  </Card>
)

MementoCard.propTypes = {
  conf: PropTypes.any,
  mckey: PropTypes.string,
  url: PropTypes.string,
  viewingCol: PropTypes.string,
  seed: PropTypes.instanceOf(Map)
}

export const MementoCardEmpty = () => (
  <Card key={'noMementos-card'}>
    <CardTitle key={'noMementos-card-title'} title={'No Seeds In Collection. Click The Plus Button To Add One'}/>
  </Card>
)

export default onlyUpdateForKeys(['seed'])(MementoCard)
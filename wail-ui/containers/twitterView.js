import React from 'react'
import { Flex } from 'react-flex'
import { namedPure } from '../util/recomposeHelpers'
import ATwitterUser from '../components/twitter/archiveConfig/aTwitterUser'
import TwitterUserTextSearch from '../components/twitter/archiveConfig/twitterUserTextSearch'

const enhance = namedPure('TwitterView')

const TwitterView = enhance(() => (
  <div style={{width: '100%', height: '100%'}}>
   <div className='wail-container' style={{marginTop: 15}}>
     <Flex row justifyContent='space-between'>
       <ATwitterUser />
       <TwitterUserTextSearch />
     </Flex>
   </div>
  </div>
))

export default TwitterView


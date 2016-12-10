import React from 'react'
import {Flex} from 'react-flex'
import ATwitterUser from '../components/twitter/archiveConfig/aTwitterUser'
import TwitterUserTextSearch from '../components/twitter/archiveConfig/twitterUserTextSearch'

const TwitterView = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <Flex row justifyContent='space-between'>
      <ATwitterUser />
      <TwitterUserTextSearch />
    </Flex>
  </div>
)

export default TwitterView


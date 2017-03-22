import React,{ PropTypes } from 'react'
import { Redirect } from 'react-router-dom'
import pure from 'recompose/pure'
import routeNames from '../routes/routeNames'
import ArchiveTwitter from '../components/twitter/archiveConfig'

const TwitterView = (_,{ store }) => (
  store.getState().get('twitter').get('userSignedIn') ? (
    <ArchiveTwitter store={store}/>
  ) : (
    <Redirect from={routeNames.twitter} to={routeNames.twitterSignIn} push/>
  )
)

TwitterView.contextTypes = {
  store: PropTypes.object
}

export default pure(TwitterView)


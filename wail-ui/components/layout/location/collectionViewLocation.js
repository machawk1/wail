import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router-dom'
import routeNames from '../../../routes/routeNames'
import linkStyle from './linkStyle'

const CollectionViewLocation = ({match}) => (
  <span style={{margin: 0, padding: 0}}><Link to={routeNames.selectCol} style={linkStyle}>Collections</Link> > {match.params.col}</span>
)

export default CollectionViewLocation
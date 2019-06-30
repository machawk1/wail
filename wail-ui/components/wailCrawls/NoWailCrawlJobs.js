import React from 'react'
import Card from 'material-ui/Card/Card'
import CardTitle from 'material-ui/Card/CardTitle'
import CardText from 'material-ui/Card/CardText'
import { Link } from 'react-router-dom'
import routeNames from '../../routes/routeNames'

export default function NoWailCrawlJobs () {
  return (
    <Link style={{textDecoration: 'none'}} to={routeNames.selectCol}>
      <Card key={'noWailCrawlJobs-Card'}>
        <CardTitle
          key={'noWailCrawlJobs-Card'}
          title='No Running Crawls'
        />
        <CardText>
          Why Not Choose A Collection And Start One?
        </CardText>
      </Card>
    </Link>
  )
}

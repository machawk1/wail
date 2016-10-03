import React, {Component, PropTypes} from 'react'
import {Card, CardHeader, CardTitle, CardText, CardActions} from 'material-ui/Card'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import autobind from 'autobind-decorator'
import _ from 'lodash'
import {Flex, Item} from 'react-flex'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import Edit from 'material-ui/svg-icons/editor/mode-edit'
import Container from 'muicss/lib/react/container'
import Divider from 'muicss/lib/react/divider'
import ReactTooltip from 'react-tooltip'
import shallowCompare from 'react-addons-shallow-compare'
import NumArchives from '../collectionHeader/numArchives'
import CollectionMetadata from './collectionMetadata'

export default class CollectionInfo extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    viewingCol: PropTypes.object.isRequired,
    viewingColRuns: PropTypes.arrayOf(PropTypes.object).isRequired,
    uniqueSeeds:  PropTypes.object.isRequired,
    totalCrawls:  PropTypes.number.isRequired
  }

  constructor (...args) {
    super(...args)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    console.log(this.context)
    let { colName, numArchives, metadata } = this.context.viewingCol
    return (
      <Container>
        <div style={{
          margin: 'auto',
          width: '100%',
          padding: '20px'
        }}>
          <Card>
            <CardTitle
              title={metadata[ 'title' ]}
            />
            <Divider/>
            <CardHeader title='Collection Data'/>
            <CardText>
              <Flex row alignItems="center">
                <Item> <CardTitle subtitle={`Seeds: ${this.context.uniqueSeeds.size}`}/></Item>
                <Item> <CardTitle subtitle={`Crawls: ${this.context.totalCrawls}`}/></Item>
                <Item><NumArchives viewingCol={colName} numArchives={numArchives}/></Item>
              </Flex>
            </CardText>
            <CardActions>
              <FlatButton primary label='Open (W)arc Location'/>
              <FlatButton primary label='Open Index Location'/>
            </CardActions>
          </Card>
        </div>
        <ReactTooltip/>
      </Container>
    )
  }

}
/*
 children={
 <span>
 <IconButton
 style={{
 float: 'left',
 bottom: '45px',
 left: '40px',
 display: 'inline-block',
 position: 'relative'
 }}
 iconStyle={{ width: 20, height: 20 }}
 >
 <Edit />
 </IconButton>

 </span>
 }
 */

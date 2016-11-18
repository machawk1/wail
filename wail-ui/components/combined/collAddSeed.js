import React, {Component, PropTypes} from 'react'
import {Flex, Item} from 'react-flex'
import {Card, CardHeader, CardTitle, CardText, CardMedia, CardActions} from 'material-ui/Card'
import {shell, remote} from 'electron'
import Promise from 'bluebird'
import {withRouter} from 'react-router'
import CollAddSeedHeader from './colAddSeedHeader'
import ArchiveForm from './archiveUrlForm'
import CheckSeed from './checkSeed'

const showResults = values =>
  new Promise(resolve => {
    console.log(values)
    setTimeout(() => {  // simulate server latency
      window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`)
      resolve()
    }, 500)
  })

export default class CollectionAddSeed extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }
  // shouldComponentUpdate (nextProps, nextState, nextContext) {
  //   console.log('col add seed should component update', shallowCompare(this, nextProps, nextState))
  //   return shallowCompare(this, nextProps, nextState)
  // }

  render () {
    console.log(this.props)
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <CollAddSeedHeader col={this.props.params.col} />
        <Card style={{ margin: '0 25px 25px 25px', height: '70%' }} id='addSeedCard'>
          <Flex row alignItems='baseline' justifyContent='space-between'>
            <ArchiveForm />
            <CheckSeed col={this.props.params.col} />
          </Flex>
        </Card>
      </div>
    )
  }
}

/*
 <Card style={{ margin: '0 25px 25px 25px'}}>
 <CardHeader title={'Seed to Add'}/>
 <CardMedia style={{ width: '90%' }}>
 <TextField
 fullWidth
 style={{ marginLeft: 25, marginRight: 25, }}
 floatingLabelText='URL'
 id='archive-url-input'
 />
 </CardMedia>
 <Flex row alignItems='baseline' justifyContent='space-between'>
 <RadioButtonGroup name='archive' defaultSelected='single-page'
 style={{ width: '50%', paddingLeft: 25, marginTop: 20 }}>
 <RadioButton
 value='single-page'
 label='Archive Page Only'
 style={styles.radioButton}
 />
 <RadioButton
 value='page-same-domain'
 label='Archive Page and internal (same domain) links'
 style={styles.radioButton}
 />
 <RadioButton
 value='page-same-domain-external'
 label='Archive Page and all (internal and external) links'
 style={styles.radioButton}
 />
 </RadioButtonGroup>
 <RaisedButton label='Check Seed' style={{ marginRight: 25 }}/>
 </Flex>
 <CardActions>
 <RaisedButton primary label='Cancel'/>
 <RaisedButton primary label='Add and Archive Now'/>
 </CardActions>
 </Card>

 */


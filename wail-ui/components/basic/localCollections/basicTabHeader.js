import React, {Component, PropTypes} from 'react'
import 'react-flex/index.css'
import shallowCompare from 'react-addons-shallow-compare'

export default class BasicTabHeader extends Component {
  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <div />
    )
  }

}

/*
 <Flex row wrap={false} alignItems="space-between">
 <Item>
 <CardHeader
 title='Archive URL'
 subtitle='Single Page'
 />
 </Item>
 <Item>
 <BasicColList/>
 </Item>

 </Flex>
 <Row>
 <Col md="6">

 </Col>
 <Col md="6">

 </Col>
 </Row>
 */

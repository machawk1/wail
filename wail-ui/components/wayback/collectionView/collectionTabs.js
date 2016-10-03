import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {Tabs, Tab} from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import shallowCompare from 'react-addons-shallow-compare'
import {remote} from 'electron'
import CollectionInfo from './collectionInfo'

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  slide: {
    padding: 10,
  },
}

export default class CollectionTabs extends Component {

  constructor (...args) {
    super(...args)
    this.state = {
      slideIndex: 0,
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }


  @autobind
  handleChange(value) {
    this.setState({
      slideIndex: value,
    })
  }

  render () {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Tabs
          onChange={this.handleChange}
          value={this.state.slideIndex}
        >
          <Tab label='Overview' value={0} />
          <Tab label='Seeds' value={1} />
          <Tab label='Captures' value={2} />
        </Tabs>
        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
        >
          <div>
           <CollectionInfo />
          </div>
          <div style={styles.slide}>
            slide n°2
          </div>
          <div style={styles.slide}>
            slide n°3
          </div>
        </SwipeableViews>
      </div>
    )
  }
}
/*
 <Card>
 <CardTitle
 title={metadata['title']}
 children={<NumArchives viewingCol={this.props.params.col} numArchives={numArchives}/>}
 />
 <ReactTooltip/>
 </Card>
 <Menu
 direction="horizontal"
 distance={80}
 width={50}
 height={50}
 y={100}
 x={100}
 customStyle={{
 color: primary1Color,
 textAlign: 'center',
 lineHeight: '60px',
 backgroundColor: primary1Color,
 border: `solid 1px ${primary1Color}`,
 borderRadius: '50%'
 }}>
 <div >
 <Apps onTouchTap={() => console.log('clicked')}/>
 </div>
 <Home />
 <Adb/>
 </Menu>
 let viewingCol = CollectionStore.getCollection(this.props.viewingCol)
 let tmdata = metadataTransform(viewingCol.metadata)
 <div>
 <Grid fluid>
 <Row between="xs">
 {
 tmdata[ 'title' ] &&
 <Col xs>
 <p>{`Title: ${tmdata[ 'title' ]}`}</p>
 </Col>
 }
 {
 tmdata[ 'description' ] &&
 <Col xs>
 <p>{`Description: ${tmdata[ 'description' ]}`}</p>
 </Col>
 }
 <Col xs>
 <NumArchives viewingCol={this.props.viewingCol}/>
 </Col>
 </Row>
 <Row>
 <Col xs>
 <CollectionCrawls height={this.props.height} viewingCol={this.props.viewingCol}/>
 </Col>
 <Col xs>
 <CollectionSearch height={this.props.height} viewingCol={this.props.viewingCol}/>
 </Col>
 </Row>
 </Grid>
 <ReactTooltip/>
 </div>
 */

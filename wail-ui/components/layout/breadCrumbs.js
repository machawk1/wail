import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {Link} from 'react-router'
import S from 'string'

export default class BreadCrumbs extends Component {
  static contextTypes = {
    routeInfo: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired,
  }
  constructor (props, context) {
    super(props, context)
    this.state = {
      path: <span>WAIL</span>,
      lastLoc: context.routeInfo.location.pathname
    }
  }

  componentWillReceiveProps (nextProps, nextContext) {
    if(this.state.lastLoc !== nextContext.routeInfo.location.pathname) {
      console.log(nextContext.routeInfo)
      let path = <span>sds</span>
      let {location} = nextContext.routeInfo
      switch (location.pathname) {
        case '/':
          path = <span>WAIL</span>
          break
        case '/wayback':
          path = <span>Wayback</span>
          break
        case '/heritrix':
          path = <span>Heritrix</span>
          break
        case '/misc':
          path = <span>Miscellaneous</span>
          break
        case '/services':
          path = <span>Services</span>
          break
        default:
          let {col} = nextContext.routeInfo.params
          let {primary2Color} = this.context.muiTheme.palette
          console.log(primary2Color)
          path = <span><Link to='wayback' style={{color: 'white'}} >Wayback</Link> / {col}</span>
          break
      }
      this.setState({
        path,
        lastLoc: location.pathname
      })
    }

  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this,nextProps,nextState)
  }

  render () {
    return (this.state.path)
  }
}

/*
 <AppBar
 title={this.state.location}
 onLeftIconButtonTouchTap={this.handleToggle}
 zDepth={0}
 iconElementRight={<Avatar backgroundColor={'transparent'} src='icons/crawling.png'  className="pulse" style={
 {paddingRight: 25,visibility: this.state.crawlIconVisible}}/>
 }
 style={{height: '50px'}}
 titleStyle={{height: '50px'}}

 />
 */
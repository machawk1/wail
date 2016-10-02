import React, {Component, PropTypes} from 'react'
import {RouteTransition} from 'react-router-transition/lib/react-router-transition'
import {blueGrey50, darkBlack, lightBlue900, cyan500, cyan700} from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Header from './header'
import Footer from './footer'
import {remote} from 'electron'

const baseTheme = getMuiTheme({
  palette: {
    primary1Color: cyan700,
    primary2Color: cyan500,
  },
  tabs: {
    backgroundColor: blueGrey50,
    textColor: darkBlack,
    selectedTextColor: darkBlack
  },
  inkBar: {
    backgroundColor: lightBlue900
  },
  userAgent: false
})

export default class Layout extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired
  }
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
    routeInfo: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
  }

  getChildContext () {
    return {
      muiTheme: baseTheme,
      routeInfo: {
        params: this.props.params,
        location: this.props.location,
        route: this.props.route
      }
    }
  }

  render () {
    console.log(this.props)
    return (
      <div className="wailContainer">
        <Header />
        <div className="layoutBody">
          {this.props.children}
        </div>
        <Footer/>
      </div>
    )
  }
}


import React, {Component, PropTypes} from 'react'

const Layout = ({ children }) => (
  { children }
)

export default Layout

// export default class Layout extends Component {
//   static propTypes = {
//     children: PropTypes.any.isRequired
//   }
//   static childContextTypes = {
//     muiTheme: PropTypes.object.isRequired,
//     routeInfo: PropTypes.object.isRequired
//   }
//
//   constructor (props, context) {
//     super(props, context)
//   }
//
//   getChildContext () {
//     return {
//       muiTheme: baseTheme,
//       routeInfo: {
//         params: this.props.params,
//         location: this.props.location,
//         route: this.props.route
//       }
//     }
//   }
//
//   render () {
//     return (
//       <div style={{width: '100%', height: '100%'}}>
//         <Header />
//         <div className='layoutBody'>
//           {this.props.children}
//         </div>
//         <Footer />
//       </div>
//     )
//   }
// }


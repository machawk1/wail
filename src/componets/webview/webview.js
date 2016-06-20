import React, {Component} from "react"
import {findDOMNode} from "react-dom"


export default class WebView extends Component {

   static propTypes = {
      disablewebsecurity: React.PropTypes.bool,
      httpreferrer: React.PropTypes.string,
      nodeintegration: React.PropTypes.bool,
      plugins: React.PropTypes.bool,
      preload: React.PropTypes.string,
      src: React.PropTypes.string,
      useragent: React.PropTypes.string
   }

   constructor(props, context) {
      super(props, context)
      this.state = {
         webviewLoaded: false,
         webview: null,
      }
   }

   componentDidMount() {
      const me = findDOMNode(this)

      this.setState({loaded: true, webview: me})

   }

   render() {
      return (<webview {...this.props}/>)
   }
}
import React, {Component, PropTypes} from "react";
import lightBaseTheme from "material-ui/styles/baseThemes/lightBaseTheme";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import Header from "./header";
import Debug from "../debug-element";
// import Editor from  '../editor/editor'
// import wb from '../editor/wayback.xml'


const baseTheme = getMuiTheme(lightBaseTheme)

export default class Layout extends Component {

   static childContextTypes = {
      muiTheme: PropTypes.object.isRequired,
   }

   constructor(props, context) {
      super(props, context)
      this.count = 0
   }


   getChildContext() {
      return {muiTheme: getMuiTheme(baseTheme)}
   }


   render() {
      this.count += 1
      console.log('layout', this.count)
      return (
         <div>
            <Header/>
            {this.props.children}
            <Debug/>
         </div>

      )
   }
}
/*
 <Editor
 ref='editor'
 codeText={wb}
 />
 */

import React from "react";
import {Route, IndexRoute} from "react-router";
import Layout from "./layout/layout";
import BasicTab from "./basic/basic-tab";
import AdvancedTab from "./advanced/advancedTab";

const Routes = (
   <Route path="/" component={Layout}>
      <IndexRoute component={BasicTab}/>
      <Route path="advanced" name='advanced' component={AdvancedTab}/>
   </Route>
)


export default Routes;


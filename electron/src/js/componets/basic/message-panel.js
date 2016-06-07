import React, {Component} from "react";
import Paper from "material-ui/Paper";
import {Grid, Row, Column} from "react-cellblock";
import CircularProgress from "material-ui/CircularProgress";
import UrlStore from "../../stores/urlStore";

export default class MessagePanel extends Component {
   constructor(props, context) {
      super(props, context)
       this.updateMementoCount = this.updateMementoCount.bind(this)
       this.urlUpdated =  this.urlUpdated.bind(this)
       this.state = {mementoCount: -1}

   }

    updateMementoCount(){
        this.setState({mementoCount: UrlStore.getMementoCount()})
    }

    urlUpdated(){
        this.setState({mementoCount: -1})
    }

    componentDidMount() {
        UrlStore.on('memento-count-updated',this.updateMementoCount)
        UrlStore.on('url-updated',this.urlUpdated)
    }

    componentWillUnmount() {
        UrlStore.removeListener('memento-count-updated',this.updateMementoCount)
        UrlStore.removeListener('url-updated',this.urlUpdated)
    }

   render() {
      const progressOrCount = this.state.mementoCount == -1 ?  <CircularProgress size={0.5}/> :  <p>{this.state.mementoCount}</p>
      return (
            <Paper zDepth={3}>
                <Grid>
                    <Row>
                        <Column  width="1/2">
                            <p>
                                Fetching memento count from public archives...
                            </p>
                        </Column>
                        <Column  width="1/2">
                            {progressOrCount}
                        </Column>
                    </Row>
                </Grid>
            </Paper>
      )
   }
}
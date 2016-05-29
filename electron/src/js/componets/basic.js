import React, {Component, PropTypes} from 'react'
import ArchiveUrl from './archive-url'
import {ButtonGroup,Button} from 'react-bootstrap'


export default class Basic extends Component{
   constructor(props) {
      super(props)
   }

   render(){
      console.log("HI hellow")
      console.log("hehehe dasass ")
      console.log("hehehe dasass e ")
      return(
          <div class="container-fluid">
             <ArchiveUrl />
             <ButtonGroup>
                <Button>Left</Button>
                <Button>Middle</Button>
                <Button>Right</Button>
             </ButtonGroup>
          </div>


      )
   }
}


import React, {Component, Proptypes} from 'react'
import {Card, CardHeader, CardText} from 'material-ui/Card'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import {withRouter} from 'react-router'
import Avatar from 'material-ui/Avatar'
class Test extends Component {
  render () {
    return (
      <div>
        <Card style={{height: '180px'}}>
          <CardHeader
            title='Things'
            subtitle='With stuff'
            avatar={
              <Avatar src='icons/whale.ico' style={{borderRadius: 0, width: '120px', height: '150px', float: 'left'}}
              />
            }
          />
          <CardText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
            Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
            Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
          </CardText>
        </Card>

        <div className='layoutChildDiv'>

          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sodales nisl tortor. In at risus in ipsum consectetur aliquam at sit amet ipsum. Maecenas tempor leo id finibus vehicula. Sed maximus sed dolor id lacinia. Vivamus sodales dui sit amet interdum vestibulum. Maecenas ac aliquam lacus. Etiam eu vestibulum felis. Maecenas facilisis vitae nunc a rutrum. Praesent tempor tempor dictum. Etiam ultrices lectus ut nisi sollicitudin, in mollis mi tincidunt. Nam malesuada odio felis. Phasellus et ipsum lorem.

          Nunc molestie eleifend magna ac accumsan. Fusce pharetra commodo nisl eu faucibus. Maecenas turpis orci, consectetur sed tempus non, malesuada eget mi. Sed molestie justo a elementum hendrerit. Etiam ullamcorper justo eu nulla ultrices malesuada. In dignissim varius lacus id faucibus. Nulla consequat mauris nec nisi suscipit, in hendrerit felis scelerisque.

          Proin faucibus erat eget nibh placerat semper. Phasellus finibus commodo fringilla. Proin rutrum iaculis urna, id rhoncus sem maximus non. Pellentesque scelerisque tristique elit, vitae pharetra felis tempor non. Sed fringilla iaculis rhoncus. Integer vitae sodales libero. Praesent commodo ligula et nisi efficitur scelerisque. Etiam molestie leo in purus blandit ultricies. Maecenas id est arcu. Ut euismod mi nisi, fringilla rutrum risus rhoncus eu. In dui magna, scelerisque feugiat quam a, lobortis ullamcorper arcu. Suspendisse laoreet tortor eu orci egestas feugiat. Proin a rutrum orci. Nullam maximus finibus tortor, eget viverra risus molestie et. Nulla facilisi. Suspendisse scelerisque mattis nulla vitae vulputate.

          Nullam congue elementum dui vitae maximus. Proin et erat efficitur, accumsan orci vitae, maximus velit. Suspendisse congue, ligula non tempus iaculis, augue nunc laoreet felis, in varius metus ante id erat. Cras nisl lectus, vulputate nec posuere ac, efficitur sit amet tellus. Donec in efficitur erat. Nullam quis aliquet nulla, ac ullamcorper ligula. Maecenas auctor sagittis mi vel porttitor. Curabitur mattis sapien bibendum, sagittis ante quis, tincidunt felis. Sed ac pretium urna. Nulla ultrices semper suscipit. Cras et consequat lacus. Cras rhoncus nisl est, at aliquam diam vestibulum id. Fusce lobortis diam id lobortis cursus. Aliquam placerat tortor non risus bibendum dignissim non sit amet nisi. Fusce nibh nunc, ullamcorper a auctor at, sollicitudin quis velit. Ut in consequat neque, sed congue magna.

          Donec a erat dui. Nulla pharetra facilisis ligula sed feugiat. Aliquam aliquet rutrum justo, quis iaculis lectus efficitur vel. Aenean sagittis, purus ac aliquam semper, arcu ligula molestie massa, vel aliquam metus ligula eget orci. Integer ut neque tempus, luctus massa eget, iaculis justo. Sed eget leo ligula. Vestibulum porta leo lacus, et posuere mi dictum non. Ut laoreet, nisl ut facilisis commodo, ipsum leo elementum tellus, ac ultrices libero leo eu nibh. Quisque eget iaculis sapien. Nullam tincidunt ut ante eget convallis. Pellentesque et est ultricies, aliquam turpis sit amet, hendrerit ex. Curabitur enim tellus, ornare at euismod id, scelerisque ut mi.

          Vestibulum congue sollicitudin mauris eget gravida. Ut consequat nec leo nec euismod. Morbi efficitur, dui et convallis consectetur, sapien libero dignissim orci, sit amet malesuada nunc mauris in dui. Donec fringilla eget magna vitae dapibus. Nulla tincidunt scelerisque mi sed placerat. Aliquam vitae auctor orci, nec pretium sapien. Praesent ullamcorper egestas tempus. Donec tellus lorem, sollicitudin sit amet auctor ut, sagittis eget quam.

          Curabitur facilisis tortor sed neque porttitor, non tincidunt nibh rhoncus. Ut quis massa elementum neque pellentesque volutpat. In luctus erat lorem, quis congue ligula cursus quis. Aenean sed tincidunt neque, et blandit eros. Maecenas posuere quam id magna malesuada blandit. In lectus augue, tincidunt nec sagittis in, feugiat eget ex. Nulla dictum tempor malesuada. Nulla fermentum mauris ipsum, nec viverra sapien pretium vel. Sed non commodo erat.

          Phasellus maximus quam at laoreet pellentesque. Pellentesque fermentum elit dui. In fringilla odio lectus, vel semper massa interdum a. Nam porta id odio ut finibus. Sed hendrerit, purus eu convallis sollicitudin, ex elit tincidunt metus, eget vestibulum augue tortor a tortor. Vivamus semper consequat est, quis sollicitudin dui aliquet at. Curabitur luctus lacus ac enim malesuada, aliquet pretium mi porta. Mauris quis mauris vitae turpis accumsan accumsan. Donec egestas vel est sit amet molestie. In id euismod nisl. Donec egestas lacus dui, sit amet tempus ante eleifend et. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer posuere nec tortor ut dictum. Donec tristique maximus massa, in auctor nibh porttitor id.

          Mauris eu ante elit. Ut ultricies, nunc vitae lobortis tristique, tellus nisi scelerisque enim, vel accumsan turpis mi a risus. Quisque dolor arcu, tincidunt nec posuere non, molestie non augue. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque dapibus turpis vel tortor scelerisque, ut elementum arcu interdum. Donec lacus diam, viverra vitae neque nec, facilisis aliquet tortor. Nam vel cursus enim, vitae vestibulum risus. Maecenas porta massa et dictum vulputate. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis lobortis maximus lacus ut commodo. Phasellus interdum sollicitudin cursus.

          Quisque quis mi ac metus maximus sollicitudin. Duis rutrum id ante quis placerat. Sed cursus, velit a vestibulum vehicula, libero ex porttitor neque, interdum suscipit tellus purus ac ligula. Sed tincidunt tempor urna. Vivamus justo neque, porta iaculis accumsan sed, eleifend et ligula. Cras in justo sed nunc vehicula lobortis laoreet vel diam. Maecenas sollicitudin tellus sem, id fermentum nibh iaculis vitae. Aenean vitae pharetra urna.

        </div>
        <div className='contentFab'>
          <FloatingActionButton>
            <ContentAdd />
          </FloatingActionButton>
        </div>
      </div>
    )
  }
}

export default withRouter(Test)

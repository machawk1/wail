import React, {Component, PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form/immutable'
import {CardActions, CardTitle} from 'material-ui/Card'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import {SelectField} from 'redux-form-material-ui'
import seedName from './seedName'

export default class SeedListItem extends Component {
  static propTypes = {
    seed: PropTypes.object.isRequired,
    submitter: PropTypes.bool.isRequired,
    canGoBack: PropTypes.bool.isRequired
  }

  render () {
    const { handleSubmit, previousPage } = this.props
    let nsL = this.props.submitter ? 'Add (W)arc Seed(s)' : 'Next'
    return (
      <form onSubmit={handleSubmit} style={{ marginLeft: 16, width: '100%', height: '100%' }}>
        <CardTitle subtitle={this.props.seed.name} />
        <div>
          <Field
            maxHeight={200}
            autoWidth
            name={seedName(this.props.seed.name)}
            component={SelectField}
            floatingLabelText='Choose Seed'>
            {
              this.props.seed.seeds.map((seed, idx) =>
                <MenuItem key={`${idx}-${seed.url}-rb`} value={seed.url} primaryText={seed.url} />)
            }
          </Field>
        </div>
        <CardActions>
          {this.props.canGoBack && <FlatButton label='Previous' onTouchTap={previousPage} />}
          <FlatButton label={nsL} type='submit' primary />
        </CardActions>
      </form>
    )
  }
}

import React from 'react'
import Checked from 'material-ui/svg-icons/toggle/check-box'
import UnChecked from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import CardHeader from 'material-ui/Card/CardHeader'
import CardTitle from 'material-ui/Card/CardTitle'
import Divider from 'material-ui/Divider'
import { RadioButton } from 'material-ui/RadioButton'
import { reduxForm } from 'redux-form/immutable'
import S from 'string'
import seedName from './seedName'
import SeedListFormPage from './seedListFormPage'
import { addToCollection } from '../../../../constants/uiStrings'

const configureFormPage = (onSubmit, warcSeeds) => {
  const formConfig = {
    form: 'fsSeedDiscovery',  // a unique identifier for this form,
    destroyOnUnmount: true,
    validate (values) {
      const errors = {}
      let name = seedName(warcSeeds[0].name)
      let realSeed = values.get(name)
      if (!realSeed) {
        errors[name] = 'Required'
      } else {
        if (S(realSeed).isEmpty()) {
          errors[name] = 'Must Select The Seed'
        }
      }
      return errors
    }
  }
  const FormPage = reduxForm(formConfig)(SeedListFormPage)
  const seeds = warcSeeds[0].seeds.map((seed, idx) =>
    <RadioButton
      checkedIcon={<Checked />}
      uncheckedIcon={<UnChecked />}
      key={`${idx}-${seed.url}-rb`}
      value={seed.url}
      label={seed.url}
    />
  )
  return (
    <div style={{width: '100%', height: 'inherit'}}>
      <CardTitle title={addToCollection.selectCorrectSeed} />
      <Divider style={{width: '95%'}} />
      <CardHeader title={warcSeeds[0].name} />
      <FormPage
        containerName={'seedListFPContainer'}
        onSubmit={onSubmit}
        warcSeeds={seeds}
        seedName={seedName(warcSeeds[0].name)}
      />
    </div>
  )
}

export default configureFormPage

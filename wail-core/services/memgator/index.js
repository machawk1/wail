import NeDB from 'nedb'
import path from 'path'
import feathersNedb from 'feathers-nedb'

export default function () {
  const app = this
  const db = new NeDB({
    filename: path.join()
  })
}
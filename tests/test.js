import test from 'ava'

test.beforeEach(/* async */ t => {
  if (!t.context.c) {
    console.log('context not created')
    t.context.c = 0
  }
  t.context.c++
  // t.context.app = new Application({
  //   path: wailReleasePath(),
  // })
  // await t.context.app.start()
})

test.afterEach.always('cleanup', /* async */ t => {
  // await t.context.app.stop()
  console.log(t.context.c)
})

test('test 1', t => {
  t.pass()
})

test('test 2', t => {
  t.pass()
})

test('test 3', t => {
  t.pass()
})


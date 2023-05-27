/*
jest is available here.
beforeAll in this file runs before each test file's beforeAll.
afterAll in this file runs before each test file's afterAll.
*/

const mockSend = jest.fn()
jest.mock('../src/getEnvs', () => ({
  ...jest.requireActual('../src/getEnvs'),
  getMailServer: () => ({
    send: mockSend
  })
}))

beforeAll(async () => {
  // Global set ups
  return
})

afterAll(async () => {
  // Global tear downs
  await new Promise(setImmediate)
  return
})

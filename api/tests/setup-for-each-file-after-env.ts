/*
jest is available here.
beforeAll in this file runs before each test file's beforeAll.
afterAll in this file runs before each test file's afterAll.
*/

const mockSend = jest.fn()
const mockGetMailServer = jest.fn()
mockGetMailServer.mockReturnValue({send: mockSend})
jest.mock('../src/services/mailServer', () => mockGetMailServer)

beforeAll(async () => {
  // Global set ups
  return
})

afterAll(async () => {
  // Global tear downs
  return
})

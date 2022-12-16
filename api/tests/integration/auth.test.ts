import request from 'supertest'
import { API_PATHS } from '../../src/constants'
import apiApp, { wsServer } from '../../src/servers/api'

describe(`POST ${API_PATHS.AUTH.LOGIN.path}`, () => {
  afterEach(() => {
    wsServer.close()
  })

  it('should return 400 if email does not exist', async () => {
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email: 'test', password: 'test' })
    expect(res.status).toBe(400)
  })
})

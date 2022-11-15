import request from 'supertest'
import { API_PATHS } from '../../src/constants'
import apiApp, { wsServer } from '../../src/servers/api'

jest.mock('../../src/getEnvs', () => ({
  WS_PORT: 3001, // TODO: Mock WS_PORT should not be set here.
  DATABASE_HOST: 'db',
  MYSQL_DATABASE: 'markdown_editor_auto_test_db',
  MYSQL_DATABASE_USERNAME_FOR_APP: 'markdown_editor_app_auto_test',
  MYSQL_DATABASE_PASSWORD_FOR_APP: 'password_for_app_auto_test',
}))

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

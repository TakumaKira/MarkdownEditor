import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import getConnection from './db/getConnection'

dotenv.config()

if (process.env.TEST_USER_NAME !== undefined && process.env.TEST_USER_PASSWORD !== undefined) {
  (async (name: string, password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const connection = await getConnection()
      await connection.execute(`CALL create_user('${name}','${hashedPassword}')`)
      console.log('User created.')
    } catch (e) {
      console.error(e)
    }
    process.exit()
  })(process.env.TEST_USER_NAME, process.env.TEST_USER_PASSWORD)
}

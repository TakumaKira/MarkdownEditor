import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import query from "./db/query"

dotenv.config()

if (process.env.TEST_USER_NAME !== undefined && process.env.TEST_USER_PASSWORD !== undefined) {
  (async (name: string, password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    query([
      [`CALL create_user('${name}','${hashedPassword}')`, (error, results, fields) => {
        if (error) {
          console.error(error)
        } else {
          console.log(results)
        }
      }],
    ])
  })(process.env.TEST_USER_NAME, process.env.TEST_USER_PASSWORD)
}

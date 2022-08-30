[How To Use JSON Web Tokens (JWTs) in Express.js _ DigitalOcean -- Step 1 — Generating a Token](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs#step-1-generating-a-token)

> The token secret is a long random string used to encrypt and decrypt the data.
>
> To generate this secret, one option is to use Node.js’s built-in crypto library, like so:

```js
require('crypto').randomBytes(64).toString('hex')
// '09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611'
```

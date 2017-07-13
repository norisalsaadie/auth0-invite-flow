const { ManagementClient } = require('auth0')
const bodyParser = require('body-parser')
const compression = require('compression')
const express = require('express')
const path = require('path')
const uuidv4 = require('uuid/v4')

const { port, domain, token } = require('./config')

const management = new ManagementClient({
  token: token,
  domain: domain
});


express()
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(compression())
  .set('view engine', 'html')
  .set('views', path.resolve(__dirname, 'views'))
  .get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'views', 'index.html')))
  .post('/users', ({ body }, res) => {
      const user = {
        connection: 'Username-Password-Authentication',
        email: body.email,
        password: uuidv4(),
        user_metadata: {},
        email_verified: true,
        verify_email: true
      }
      management
        .createUser(user)
        .then(u =>
          management.createEmailVerificationTicket({ user_id: u.user_id, result_url: 'http://localhost:3000/authorise' })
        )
        .then(t => res.json(t))
        .catch(e => res.json(e))

  })
  .get('/authorise', (req, res) => res.sendFile(path.resolve(__dirname, 'views', 'authorise.html')))
  .listen(port, () => console.log(`up and running on ${port}`))

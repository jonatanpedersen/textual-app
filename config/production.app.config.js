export default {
  data: process.env.DATA,
  host: process.env.HOST,
  port: process.env.PORT,
  session: {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  },
  github: {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    callback_url: process.env.HOST + '/auth/github/callback'
  },
  mongodb: {
    connectionString: process.env.MONGODB
  },
  logger: {
    path: process.env.LOG
  },
  ssl: {
    ca: [
      process.env.SSL_CA1,
      process.env.SSL_CA2
    ],
    key: process.env.SSL_KEY,
    cert: process.env.SSL_CERT,
    passphrase : process.env.SSL_PASSPHRASE
  }
}

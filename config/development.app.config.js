export default {
  data: './data',
  host: 'https://localhost',
  port: 80,
  session: {
    secret: 'HYXe2rKZPw4Ar893mrL3W0o8fCIq0X3aE1k868uok1GXUF2gdoEg092YC3Iuqu3b',
    resave: false,
    saveUninitialized: true
  },
  github: {
    client_id: 'cf1635091c35b7fe1fb8',
    client_secret: 'f4bfb04353edd24e69fcda04aeae8e93def8f556',
    callback_url: 'https://localhost/auth/github/callback'
  },
  mongodb: {
    connectionString: 'mongodb://localhost:27017/translate-app-test'
  },
  logger: {
    path: './log.txt'
  },
  ssl: {
    ca: [
      './certs/jonatanpedersen-intermediate-ca.cert.pem',
      './certs/jonatanpedersen-ca.cert.pem'
    ],
    key: './certs/localhost.key.pem',
    cert: './certs/localhost.cert.pem',
    passphrase: 'nq5nmn0YsOsEIHX6VPUKI3o3AftaKN0C84nLKZHgLEFvyy5FA79x3esriTkDExRx'
  }
}

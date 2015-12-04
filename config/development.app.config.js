export default {
  data: './data',
  host: 'http://localhost',
  port: 80,
  session: {
    secret: 'HYXe2rKZPw4Ar893mrL3W0o8fCIq0X3aE1k868uok1GXUF2gdoEg092YC3Iuqu3b',
    resave: false,
    saveUninitialized: true
  },
  github: {
    client_id: 'cf1635091c35b7fe1fb8',
    client_secret: 'f4bfb04353edd24e69fcda04aeae8e93def8f556',
    callback_url: 'http://localhost/auth/github/callback'
  },
  mongodb: {
    connectionString: 'mongodb://translate-app:PGTXeVlqYcv22JTx@46.101.113.122:27017/translate-app-test'
  },
  logger: {
    path: './log.txt'
  }
}

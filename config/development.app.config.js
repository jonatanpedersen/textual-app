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
  jwt: {
    secret: 'K4xEToZq6e9ED7SsxR0D1DSVFXGqRQGj'
  },
  mongodb: {
    connectionString: 'mongodb://localhost:27017/textual-app-test'
  }
}

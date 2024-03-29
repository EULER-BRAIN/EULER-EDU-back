/* get env values */
const env = require('./src/tools/env');

/* make a express object */
const express = require("express");
const app = express();
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(express.json({ limit: "50mb" }));

/* cors */
app.use(require('cors')({ origin: true, credentials: true }));

/* session, cookie */
const expressSession = require('express-session');
const sessionFileStore = require('session-file-store')(expressSession);
const session = expressSession({
  secret: env.session || 'session-secret',
  resave: false, saveUninitialized: false,
  store: new sessionFileStore({ logFn: function(){}, useAsync: true }),
  // cookie:{ httpOnly: true, sameSite: 'none', maxAge: 5300000, secure: true }
});
app.use(session);
// app.use(require('cookie-parser')());

/* middlewares */
app.use(require('./src/middlewares/auth'));

/* route */
app.use("/main", require("./src/route/main"));
app.use("/login", require("./src/route/login"));
app.use("/admin", require("./src/route/admin"));
app.use("/management", require("./src/route/management"));

/* create a Express Server */
if (env.port.http) {
  const http = require("http");
  http.createServer(app).listen(env.port.http, () => {
    console.log(`Express http 서버가 ${ env.port.http }번 포트에서 시작됨.`)
  });
}
if (env.port.https) {
  const https = require("https");
  https.createServer(app).listen(env.port.https, () => {
    console.log(`Express https 서버가 ${ env.port.https }번 포트에서 시작됨.`)
  });
}

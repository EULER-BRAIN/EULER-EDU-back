const env = require('../tools/env');

module.exports = (req, res, next) => {
    if (env.port.dev == 'local') next();
    else if(req.loginLevel == 'administrator') next();
    else res.redirect('/');
}

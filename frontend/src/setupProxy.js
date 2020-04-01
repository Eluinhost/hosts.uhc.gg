const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const middleware = createProxyMiddleware({ target: 'http://localhost:10000' });
  app.use('/api', middleware);
  app.use('/authenticate', middleware);
};

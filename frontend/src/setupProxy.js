const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware({
      target: 'http://localhost:10000',
      pathFilter: ['/api', '/authenticate'],
    }),
  );
};

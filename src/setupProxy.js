const https = require('https');

// The API Gateway endpoints send no CORS headers (OPTIONS fails), so the CRA dev server
// forwards these fixed routes server-side. Only this whitelist is proxied: never an open proxy.
const TARGETS = {
  '/api/login': 'https://qf5k9fspl0.execute-api.us-east-1.amazonaws.com/default/login',
  '/api/balance': 'https://2k0ic4z7s5.execute-api.us-east-1.amazonaws.com/default/balance',
  '/api/transfer': 'https://ofqx4zxgcf.execute-api.us-east-1.amazonaws.com/default/transfer',
  '/api/transferList': 'https://n0qaa2fx3c.execute-api.us-east-1.amazonaws.com/default/transferList',
};

const FORWARDED_HEADERS = ['content-type', 'content-length', 'authorization'];

module.exports = (app) => {
  app.use('/api', (req, res) => {
    const target = TARGETS[req.originalUrl.split('?')[0]];
    if (!target) return res.writeHead(404).end();

    const headers = {};
    FORWARDED_HEADERS.forEach((name) => {
      if (req.headers[name]) headers[name] = req.headers[name];
    });

    const upstream = https.request(target, { method: req.method, headers, timeout: 10000 }, (apiRes) => {
      res.writeHead(apiRes.statusCode, {
        'content-type': apiRes.headers['content-type'] || 'application/json',
      });
      apiRes.pipe(res);
    });

    upstream.on('timeout', () => upstream.destroy(new Error('timeout')));
    upstream.on('error', () => {
      if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ message: 'No se pudo conectar con el servidor' }));
    });

    req.pipe(upstream);
  });
};

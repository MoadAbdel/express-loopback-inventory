const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 9001;

// Noms de containers Docker en priorite : le DNS interne de Docker resout
// ces noms vers l'IP courante du service, sans avoir a la coder en dur.
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://inventory:3000';
const ORDER_URL = process.env.ORDER_URL || 'http://order:3001';
const PAYMENT_URL = process.env.PAYMENT_URL || 'http://payment:3002';

app.use(
  '/api/inventory',
  createProxyMiddleware({
    target: INVENTORY_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/inventory': '' },
  })
);

app.use(
  '/api/order',
  createProxyMiddleware({
    target: ORDER_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/order': '' },
  })
);

app.use(
  '/api/payment',
  createProxyMiddleware({
    target: PAYMENT_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/payment': '' },
  })
);

app.get('/', (req, res) => {
  res.send('API Gateway is up');
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});

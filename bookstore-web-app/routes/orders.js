var express = require('express');
var router = express.Router();
var axios = require('axios');

var GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:9001';
var ORDER_PATH = GATEWAY_URL + '/api/order/orders';

/* GET /orders - display the order list + add-order form */
router.get('/', async function (req, res, next) {
  try {
    var response = await axios.get(ORDER_PATH);
    res.render('orders', { orders: response.data, error: null });
  } catch (err) {
    res.render('orders', { orders: [], error: 'Impossible de contacter le microservice order (via le gateway).' });
  }
});

/* POST /orders - create an order then redirect to refresh the list */
router.post('/', async function (req, res, next) {
  try {
    await axios.post(ORDER_PATH, {
      product: req.body.product,
      quantity: Number(req.body.quantity),
    });
    res.redirect('/orders');
  } catch (err) {
    try {
      var response = await axios.get(ORDER_PATH);
      res.render('orders', { orders: response.data, error: "Echec de l'ajout de la commande." });
    } catch (e) {
      res.render('orders', { orders: [], error: "Echec de l'ajout de la commande." });
    }
  }
});

module.exports = router;

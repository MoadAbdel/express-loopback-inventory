var express = require('express');
var router = express.Router();
var axios = require('axios');

var GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:9001';
var PAYMENT_PATH = GATEWAY_URL + '/api/payment/payments';

/* GET /payments - display the payment list + add-payment form */
router.get('/', async function (req, res, next) {
  try {
    var response = await axios.get(PAYMENT_PATH);
    res.render('payments', { payments: response.data, error: null });
  } catch (err) {
    res.render('payments', { payments: [], error: 'Impossible de contacter le microservice payment (via le gateway).' });
  }
});

/* POST /payments - create a payment then redirect to refresh the list */
router.post('/', async function (req, res, next) {
  try {
    await axios.post(PAYMENT_PATH, {
      orderId: req.body.orderId,
      amount: Number(req.body.amount),
    });
    res.redirect('/payments');
  } catch (err) {
    try {
      var response = await axios.get(PAYMENT_PATH);
      res.render('payments', { payments: response.data, error: "Echec de l'ajout du paiement." });
    } catch (e) {
      res.render('payments', { payments: [], error: "Echec de l'ajout du paiement." });
    }
  }
});

module.exports = router;

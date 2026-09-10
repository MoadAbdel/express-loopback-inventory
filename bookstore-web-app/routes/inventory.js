var express = require('express');
var router = express.Router();
var axios = require('axios');

var GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:9001';
var INVENTORY_PATH = GATEWAY_URL + '/api/inventory/books';

/* GET /inventory - display the book list + add-book form */
router.get('/', async function (req, res, next) {
  try {
    var response = await axios.get(INVENTORY_PATH);
    res.render('inventory', { books: response.data, error: null });
  } catch (err) {
    res.render('inventory', { books: [], error: 'Impossible de contacter le microservice inventory (via le gateway).' });
  }
});

/* POST /inventory - create a book then redirect to refresh the list */
router.post('/', async function (req, res, next) {
  try {
    await axios.post(INVENTORY_PATH, {
      title: req.body.title,
      author: req.body.author,
    });
    res.redirect('/inventory');
  } catch (err) {
    try {
      var response = await axios.get(INVENTORY_PATH);
      res.render('inventory', { books: response.data, error: "Echec de l'ajout du livre." });
    } catch (e) {
      res.render('inventory', { books: [], error: "Echec de l'ajout du livre." });
    }
  }
});

module.exports = router;

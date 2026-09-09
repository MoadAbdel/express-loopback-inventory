var express = require('express');
var router = express.Router();
var axios = require('axios');

var LB4_API_URL = process.env.LB4_API_URL || 'http://localhost:3000';

/* GET /inventory - display the book list + add-book form */
router.get('/', async function (req, res, next) {
  try {
    var response = await axios.get(LB4_API_URL + '/books');
    res.render('inventory', { books: response.data, error: null });
  } catch (err) {
    res.render('inventory', { books: [], error: 'Impossible de contacter le microservice LoopBack 4.' });
  }
});

/* POST /inventory - create a book then redirect to refresh the list */
router.post('/', async function (req, res, next) {
  try {
    await axios.post(LB4_API_URL + '/books', {
      title: req.body.title,
      author: req.body.author,
    });
    res.redirect('/inventory');
  } catch (err) {
    try {
      var response = await axios.get(LB4_API_URL + '/books');
      res.render('inventory', { books: response.data, error: "Echec de l'ajout du livre." });
    } catch (e) {
      res.render('inventory', { books: [], error: "Echec de l'ajout du livre." });
    }
  }
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/secret', function(req, res, next) {
  res.render("secret.ejs");
});


module.exports = router;

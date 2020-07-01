const express = require('express');
const router = express.Router();
const {ensureAuthenticated,forwardAuthenticated } = require('../Config/authentication') ;
const os = require('os')
var hostname = os.hostname();
router.get('/', forwardAuthenticated, (req, res) => res.render('login'));

/* GET home page. */
router.get('/index', ensureAuthenticated, (req, res) =>
  res.render('index', {
    user: req.user , host: hostname
  })
);

module.exports = router;

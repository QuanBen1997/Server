const express = require('express');
const router = express.Router();
const {ensureAuthenticated,forwardAuthenticated } = require('../Config/authentication') ;

router.get('/', forwardAuthenticated, (req, res) => res.render('login'));

/* GET home page. */
router.get('/index', ensureAuthenticated, (req, res) =>
  res.render('index', {
    user: req.user , title: 'Express'
  })
);

module.exports = router;

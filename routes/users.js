const express = require('express');
const router = express.Router();
const { forwardAuthenticated } = require('../Config//authentication');
const passport = require('passport');

// Login Page
router.get('/login',forwardAuthenticated ,  (req, res) => res.render('login'));

// Login
router.post('/login', 
  passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/users/login',
    failureFlash: true
  })
);

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out !');
  res.redirect('/users/login');
});

module.exports = router;

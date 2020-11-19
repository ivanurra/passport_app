const express     = require('express');
const router      = express.Router();
const User        = require('../models/User')
const bcrypt      = require("bcrypt");
const passport     = require('passport')
const ensureLogin = require('connect-ensure-login')

/* GET home page */

router.get('/signup', (req, res, next) => {
  res.render('signup');
});
router.post('/signup', (req, res, next) => {
  const {username, password} = req.body
  if (username === "" || password === "") {
    res.render("signup", {
      errorMessage: "Indicate a username and a password to sign up"
    })
    return
  }
  User.findOne({username})
  .then((result)=>{
    if(!result){
      bcrypt.hash(password, 10)
        .then((hashedPassword)=>{
          User.create({username, password: hashedPassword})
            .then(()=>res.redirect('/'))
        })       
    } else {
      res.render('signup', {errorMessage: 'This user already exists. Please, try again'})
    }
  })
  .catch((err)=>res.send(err)) 
})

router.get('/login', (req, res) => {
  res.render('login', {errorMessage: req.flash('error')})
})

router.post('/login', passport.authenticate("local",{
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}))

router.get('/private-page', ensureLogin.ensureLoggedIn(), (req,res)=>{
  res.render('private',{user: req.user.username})
})

router.get('/logout', (req, res)=>{
  req.logout()
  res.redirect('/')
})

module.exports = router;

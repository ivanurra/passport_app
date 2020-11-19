const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt')
const passport = require('passport')
const ensureLogin = require('connect-ensure-login')

const User = require('../models/User')
const Quote = require('../models/Quote')


router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req, res)=>{

  const {username, password} = req.body

  if(username === '' || password === ''){
    res.render('signup', {errorMessage: 'You have to fill all the fields'})
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

router.get('/login', (req, res)=>{
  res.render('login', {errorMessage: req.flash('error')})
})

router.post('/login', passport.authenticate("local", {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}))

router.get('/private-page', ensureLogin.ensureLoggedIn(), (req, res)=>{
  res.render('private', {user: req.user.username})
})

router.get('/logout', (req, res)=>{
  req.logout()
  res.redirect('/')
})

const checkForAuthentification = (req, res, next)=>{
  if(req.isAuthenticated()){
    return next()
  } else {
    res.redirect('login')
  }
} 

router.get('/quotes', checkForAuthentification, (req, res)=>{

  Quote.find({owner: req.user._id})
    .then((result)=>{
      res.render('myQuotes', {quotes: result})
    })
    .catch((err)=>{
      res.send(err)
    })
})

router.get('/create-quote', checkForAuthentification, (req, res)=>{
  res.render('createQuote')
})

router.post('/quotes', (req, res)=>{
  const {artist, songName, quoteContent} = req.body
  const id = req.user._id

  Quote.create({artist, songName, quoteContent, owner: id})
    .then(() => res.redirect('/quotes'))
    .catch((err) => res.send(err))
})

router.get('/all-quotes', checkForAuthentification, (req, res)=>{
  Quote.find({})
    .then((result)=>{
      res.render('allQuotes', {quotes: result})
    })
    .catch((err)=>{
      res.send(err)
    })
})

router.get('/quote/:id', (req, res)=>{
  const id = req.params.id
  
  Quote.findOne({_id: id})
    .then((result)=>{
      if(result.owner.toString() == req.user._id.toString()){
        res.render('oneQuote')
      } else {
        res.redirect('/')        
      }
    })
})

module.exports = router;
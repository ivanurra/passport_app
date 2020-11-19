require('dotenv').config();

const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const express       = require('express');
const favicon       = require('serve-favicon');
const hbs           = require('hbs');
const mongoose      = require('mongoose');
const logger        = require('morgan');
const path          = require('path');
const passport      = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session       = require('express-session')
const bcrypt        = require('bcrypt')
const flash         = require('connect-flash')

const User          = require('./models/User')

mongoose
  .connect(`mongodb+srv://passport:${process.env.ENV}@cluster0.nnqlz.mongodb.net/passport-app?retryWrites=true&w=majority`,{useNewUrlParser: true, useUnifiedTopology:true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Middleware Session
app.use(session({secret:'ourPassword', resave: true, saveUninitialized: true}))

//Middleware serialize user
passport.serializeUser((user, callback)=>{
  callback(null, user._id)
})

//Middleware deserialize user
passport.deserializeUser((id, callback)=>{
  User.findById(id)
  .then((user)=>{
    callback(null, user)
  })
  .catch((err)=>{
    callback(err)
  })
})

//Middleware Flash
app.use(flash())

//Middleware Strategy
passport.use(new LocalStrategy({passReqToCallback: true}, (req, username, password, next)=>{
  User.findOne({username})
  .then((user)=>{

    if(!user){
      return next(null, false, {message: "Incorrect username"})
    }
    if(!bcrypt.compareSync(password, user.password)){
      return next(null, false, {message: "Incorrect password"})
    }
    return next(null, user)
  })
  .catch((err)=> next(err))
}))

//Middleware passport -- ALWAYS THE LAST ONE ABOUT MIDDLEWARE
app.use(passport.initialize())
app.use(passport.session())

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';


//ROUTES
const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth')
app.use('/', auth)

module.exports = app;

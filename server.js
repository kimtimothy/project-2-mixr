const express = require('express');
const app = express();
const PORT = 3333;
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const session = require('express-session')
const User = require('./models/users')
const Content = require('./models/contents')
const usersController = require('./controllers/users')
const contentsController = require('./controllers/contents')

require('./db/db')


app.use(session({
    secret: "this is a random secret string",
    resave: false, 
    saveUninitialized: false 
}));

app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use('/users', usersController)
app.use('/contents', contentsController)


//route page
app.get('/', (req,res) => {
    console.log(req.session, 'home route')
    res.render('route.ejs')
});

//home page
app.get('/home', async (req,res) => {
    if(!req.session.userId) {
        res.redirect('/')
    }
    console.log(req.session, 'home route')
    const foundUser = await User.findById(req.session.userId)
    console.log(req.session.userId)
    try {
        const users = await User.find({}).populate('content')
        const content = await Content.find({})
        console.log(foundUser, 'this is founduserrr')
        res.render('index.ejs', {
            message: req.session.message,
            logOut: req.session.logOutMsg,
            users: users,
            content: content,
            user: foundUser,
            currentUser: req.session.userId,
            logged: req.session.logged
        });
    } catch(err) {
        console.log(err)
    }
   
});

app.listen(PORT, () => {
    console.log('listening on port', 3333)
});


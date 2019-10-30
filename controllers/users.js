const express = require('express');
const router = express.Router();
const User = require('../models/users')
const Content = require('../models/contents')
const bcrypt = require('bcryptjs');

//index
router.get('/', async (req, res) => { //to show all the work of that user
    try {
        const allUsers = await User.find({})
        res.render('users/index.ejs', {
                users: allUsers,
        });
    } catch(err) {
        console.log(err)
    }
});

//new user
router.get('/signup', (req, res) => {
    console.log('hit the signup route')
    res.render('users/registration.ejs')
});

//login route
router.get('/login', (req, res) => {
    console.log('hit the login route')
    res.render('users/login.ejs')
});

//logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            res.send(err);
        } else {
            res.redirect('/');
        }
    });
});

// show 
router.get('/:id', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.id)
        res.render('users/show.ejs', {
            user: foundUser
        })
    } catch(err){
        console.log(err)
    }
});

// profile
router.get('/:id/profile', async (req, res) => {
    console.log("this is hitting")
    try {
        const foundUser = await User.findById(req.params.id)
        res.render('users/profile.ejs', {
            user: foundUser
        });
    } catch(err){
        console.log(err)
    }
});

// edit
router.get('/:id/edit', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.id)
        res.render('users/edit.ejs', {
            user: foundUser
        });
    } catch(err){
        console.log(err)
    }
});

// delete 
router.delete('/:id', async (req, res) => {
    try {
        //collect all deletedUsers article id's
        const deletedUser = await User.findByIdAndRemove(req.params.id)
        
        const contentIds = [];
        for(let i = 0; i < deletedUser.contents.length; i++) {
            contentIds.push(deletedUser.contents[i]._id);
        }
        // remove all the contents attached to User

        const deleteContents = await Content.deleteMany(
            {
                _id: {
                    $in: contentIds
                }
            },
            res.redirect('/users')
        )
    } catch(err) {
        console.log(err)
    }
}); 

//put
router.put('/:id', async (req, res) => {
    try {
    const updatedUser = User.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.redirect('/users')
    } catch(err) {
        console.log(err)
    }
});

//login post
router.post('/login', async (req, res) => {
    //to find if user exists
    try {
        const foundUser = await User.findOne({username: req.body.username})
        if(foundUser) {
            if(bcrypt.compareSync(req.body.password, foundUser.password)){
                req.session.message = '';
    
                req.session.username = req.body.username
                req.session.logged = true;
                req.session.userId = foundUser._id;
                console.log(req.session)
    
                res.redirect('/users/'+req.session.userId+'/profile');
            } else {
                //if pw's dont match
                req.session.message = "the username or password is incorrect"
                res.redirect('/')
            }
        } else {
            req.session.message = "the username or password is incorrect"
            res.redirect('/')
        }
    } catch(err) {
        console.log(err)
    }
    });

//registration post
router.post('/signup', async (req, res) => {
    console.log('hit register route')
    const foundUser = await User.findOne({username: req.body.username})
    try {
        if(foundUser) {
            req.session.message = "Username already taken. Please try another."
            res.redirect('/users/signup')
        } else {
            const password = req.body.password;
            const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10))

            const userDbEntry = {};
            userDbEntry.username = req.body.username;
            userDbEntry.password = passwordHash;
    
            const createdUser = await User.create(userDbEntry);
            console.log(createdUser)
            req.session.username = createdUser.username;
            req.session.userId = createdUser._id;
            req.session.logged = true;

            req.session.message = "You have created an account successfully!"
            res.redirect('/users/'+req.session.userId+'/profile')
    } 
} catch(err) {
        console.log(err)
}
});














module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/users')
const Content = require('../models/contents')
const bcrypt = require('bcryptjs');

//index
router.get('/', async (req, res) => { 
    try {
        const allUsers = await User.find({})
        res.render('users/index.ejs', {
                users: allUsers,
                currentUser: req.session.userId,
                logged: req.session.logged
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
    const foundUser = await User.findById(req.params.id)
    const getContent = await Content.find({});
    console.log(foundUser, 'this is found user')
    console.log(getContent, 'this is found content')
    try {
        const foundUser = await User.findById(req.params.id)
        const contentObjects = [];
        for (let i = 0; i < foundUser.content.length; i++){
            let foundContent = await Content.findById(foundUser.content[i])
            // console.log(foundContent+"FOUND THE THING WE ARE PUSHING")
            contentObjects.push(foundContent)
        }
        res.render('users/show.ejs', {
            user: foundUser,
            content: contentObjects
        })
    } catch(err){
        console.log(err)
    }
});

// profile
router.get('/:id/profile', async (req, res) => {
    const foundUser = await User.findById(req.params.id)
    const getContent = await Content.find({});
    console.log(foundUser, 'this is found user')
    console.log(getContent, 'this is found content')
    try {
        const foundUser = await User.findById(req.params.id)
        // console.log(foundUser + "THIS IS THE USER")
        const contentObjects = [];
        for (let i = 0; i < foundUser.content.length; i++){
            let foundContent = await Content.findById(foundUser.content[i])
            // console.log(foundContent+"FOUND THE THING WE ARE PUSHING")
            contentObjects.push(foundContent)
        }
        // console.log(contentObjects)
        res.render('users/profile.ejs', {
            user: foundUser,
            content: contentObjects
        });
    } catch(err){
        console.log(err)
    }
});

// edit
router.get('/:id/edit', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.id)
        console.log(foundUser, "this is founduser")
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
        for(let i = 0; i < deletedUser.content.length; i++) {
            contentIds.push(deletedUser.content[i]._id);
        }
        // remove all the contents attached to User

        const deleteContents = await Content.deleteMany(
            {
                _id: {
                    $in: contentIds
                }
            },
            res.redirect('/')
        )
    } catch(err) {
        console.log(err)
    }
}); 

//put
router.put('/:id', async (req, res) => {
    try {
    const foundUser = await User.findById(req.params.id);
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
    const oldName = foundUser.username;
    console.log(oldName, 'this is old name')
    console.log(req.body.username, 'this is user name')
    const updateContent = await Content.updateMany({"username": oldName}, { $set: {'username': req.body.username}});

    console.log(updateContent, 'this is update content')
    console.log(updatedUser, 'this isUpdatedUser put')
    req.session.userId = updatedUser._id;
    console.log(req.session.userId, 'this is req sess id')
    res.redirect('/users/'+req.session.userId+'/profile')
    } catch(err) {
        console.log(err)
    }
});

//login post
router.post('/login', async (req, res) => {
    //to find if user exists
    console.log('hit login route')
    try {
        const foundUser = await User.findOne({username: req.body.username})
        console.log(foundUser, 'this is found user')
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
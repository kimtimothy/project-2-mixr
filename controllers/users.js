const express = require('express');
const router = express.Router();
const User = require('../models/users')

//new
router.get('/signup', (req, res) => {
    res.render('users/registration.ejs')
});

//login route
router.get('/login', (req, res) => {
    res.render('users/login.ejs')
});

//login post
router.post('/login', async (req, res) => {
    req.session.username = req.body.username

    req.session.logged = true;

    res.redirect('/users') // to feed?
});

//registration post
router.post('/signup', async (req, res) => {
//to find if user exists
try {
    const user = await User.findOne({username: req.body.username})
    if(user) {
        if(bcrypt.compareSync(req.body.password, user.password)){
            req.session.message = '';

            req.session.username = req.body.username
            req.session.logged = true;
            console.log(req.session)

            res.redirect('/users');
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

//index
router.get('/', async (req, res) => { //to show all the work of that user
    try {
        const allUsers = await User.find({})
            
        res.render('users/index.ejs', {
                users: allUsers
        });
    } catch(err) {
        console.log(err)
    }
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

// edit
router.get('/:id/edit', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.id)
        res.render('users/edit.ejs')
    } catch(err){
        console.log(err)
    }
})

//post
router.post('/', async (req, res) => {
    try {
        const createdUser = await User.create(req.body)
        res.redirect('/users')
    } catch(err) {
        console.log(err)
    }
});

// delete 
router.delete('/:id', async (req, res) => {
    try {
        //collect all deletedUsers article id's
        const deletedUser = await User.findByIdAndRemove(req.params.id)
        
        const contentsIds = [];
        for(let i = 0; i < deletedUser.contents.length; i++) {
            contentsIds.push(deletedUser.contents[i]._id);
        }
        // remove all the contents attached to User

        const deleteContents = await Content.deleteMany(
            {
                _id: {
                    $in: contentsIds
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










module.exports = router;
const express = require('express');
const router = express.Router();
const Content = require('../models/contents');
const User = require ('../models/users');

//index
router.get('/', async (req, res) => {
    try {
        const foundContents = await Content.find({});
            res.render('contents/index.ejs', {
                contents: foundContents
            });
        } catch(err) {
            res.send(err);
        }
});

//new
router.get('/new', async (req, res) => {
    try {
        const allUsers = await User.find();

            res.render('contents/new.ejs', {
                users: allUsers
            });
    } catch(err) {
        res.send(err)
    }
});

//show
router.get('/:id', async (req, res) => {
    try {
        const foundUser = await foundUser.findOne({'contents': req.params.id})
                                         .populate(
                                             {
                                                path: 'contents',
                                                match: {_id: req.params.id}
                                             }
                                         )
                                         .exec()
            res.render('contents/show.ejs', {
                user: foundUser,
                content: foundUser.contents[0]
            });
    } catch(err) {
        res.send(err);
    }
});

//edit
router.get('/:id/edit', async (req, res) => {
    try {
        const allUsers = await User.find({});
        const foundContentUser = await User.findOne({'contents': req.params.id})
                                           .populate({path: 'contents', match: {_id: req.params.id}})
                                           .exec()

            res.render('contents/edit.ejs', {
                content: foundContentUser.contents[0],
                users: allUsers,
                contentUser: foundContentUser
            });
        } catch(err) {
            res.send(err);
        }   
});

//post
router.post('/', async (req, res) => {
    try {
        const findUser = User.findById(req.body.userId);
        const createContent = Content.create(req.body);

        const [foundUser, createdContent] = await Promise.all([findUser, createContent]);

        foundUser.articles.push(createdContent);

        await foundUser.save()
        res.redirect('/contents');
        } catch(err) {
            res.send(err)
        }
});

//delete
router.delete('/:id', async (req, res) => {
    try {
            const deleteContent = Content.findByIdAndRemove(req.params.id);

            const findUser = User.findOne({'contents': req.params.id});

            const [deletedContentResponse, foundUser] = await Promise.all ([deleteContent, findUser]);
        
            foundUser.contents.remove(req.params.id);
            await foundUser.save()

            res.redirect('/contents');
        } catch(err){
            res.send(err);
        }
});

//put
router.put('/:id', async (req, res) => {
    try {
        const findUpdatedContent = Content.findByIdAndUpdate(req.params.id, req.body, {new: true});
        const findFoundUser = User.findOne({'contents': req.params.id});

        const [updatedContent, foundUser] = await Promise.all([findUpdatedContent, findFoundUser]);
         
        if(foundUser._id.toString() != req.body.userId) {
            foundUser.contents.remove(req.params.id);

            await foundUser.save();

            const newUser = await User.findById(req.body.userId);
            newUser.contents.push(updatedContent);

            const savedNewUser = await newUser.save();

            res.redirect('/contents/' + req.params.id);
            } else {
                res.redirect('/contents/' + req.params.id);
            }
        } catch(err) {
            console.log(err);
            res.send(err);
        }
});






module.exports = router;
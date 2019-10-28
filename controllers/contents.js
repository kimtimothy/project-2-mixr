const express = require('express');
const router = express.Router();

//new
router.get('/new', (req, res) => {
    res.render('contents/new.ejs')
});

//show
router.get('/', async (req, res) => {
    try {
        const foundContents = await Content.find({});
        res.render('contents/index.ejs')
    } catch(err) {
        console.log(err)
    }
})

//index
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
        console.log(err)
    }
});


//edit
router.get('/:id/edit', async (req, res) => {
    try {
        const allUsers = await User.find({})
        
        const foundContentUser = await User.findOne({'contents': req.params.id})
                                           .populate({path: 'contents', match: {_id: req.params.id}}) 
                                           .exec()

            res.render('contents/edit.ejs', {
                content: foundContentUser.contents[0],
                users: allUsers,
                contentUser: foundContentUser
            });
    } catch(err) {
        console.log(err)
    }
});

//post
router.post('/', async (req, res) => {
try {
    const findUser = await User.findById(req.body.userId);
    const createContent = await Content.create(req.body);

    const [foundUser, createdContent] = await Promise.all([findUser, createContent]);

    foundUser.articles.push(createdContent);

    await foundUser.save()
    res.redirect('/contents')
} catch(err) {
    console.log(err)
}
});

//delete
router.delete('/:id', async (req, res) => {
    try {
        const deleteContent = await Content.findByIdAndRemove(req.params.id);

        const findUser = await User.findOne({'contents': req.params.id});

        const [deletedContentResponse, foundUser] = await Promise.all ([deleteContent, findUser]);
        
        foundUser.contents.remove(req.params.id);
        await foundUser.save()

        res.redirect('/contents')
    } catch(err){
        console.log(err)
    }
})

//put
router.put('/:id', async (req, res) => {
    try {
        const findUpdatedContent = await Content.findByIdAndUpdate(req.params.id);
        const findFoundUser = await User.findOne({'contents': req.params.id});

        const [updatedContent, foundUser] = await Promise.all([findUpdatedContent, findFoundUser]);
         
        if(foundUser._id.toString() != req.body.userId) {
            foundUser.contents.remove(req.params.id);

            await foundUser.save();

            const newUser = await User.findById(req.body.userId)
            newUser.contents.push(updatedContent);

            res.redirect('/contents/' + req.params.id)
        } else {
            res.redirect('/contents/' + req.params.id)
        }

    } catch(err) {
        console.log(err)
    }
});






module.exports = router;
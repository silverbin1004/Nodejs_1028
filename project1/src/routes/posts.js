const express= require('express');
const router = express.Router();
const Post = require('../models/Post');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {body, validationResult} = require('express-validator');
const CustomError = require('../utils/CustomError');

router.post('/', authenticate, [
  body('title').notEmpty().withMessage('Title is required.'),
  body('content').isLength({min:10}).withMessage('Content must be at least 10 Characters')
], async(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next(new CustomError('Validation Failed', 400));
  }
  try {
    const {title, content} = req.body;
    const post = await Post.create({title, content, author: req.user.id});
    res.status(201).json(post);
  } catch(err){
    next(err);
  }
});

router.get('/', async(req,res,next)=>{
  try{
    const posts = await Post.find().populate('author','username');
    res.json(posts);
  } catch(err){
    next(err);
  }
});

router.get('/:id', async(req,res,next)=>{
  try{
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if(!post) {
      return next(new CustomError('Post not found', 404));
    }
    res.json(post);
  } catch(err){
    next(err);
  }
});

router.put('/:id', authenticate, async(req,res,next)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(!post){
      return next(new CustomError('Post not found', 404));
    }
    if(post.author.toString() !== req.user.id && req.user.role !== 'Admin'){
      return next(new CustomError('Unauthorized', 403));
    }
    const {title, content} = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();
    res.json(post);
  } catch (err){
    next(err);
  }
});

router.delete('/:id', authenticate, authorize(['Admin']), async (req,res,next)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(!post){
      return next(new CustomError('Post not found'), 404);
    }
    await post.remove();
    res.json({message: 'Post deleted successfully'});
  } catch(err){
    next(err);
  }
});

module.exports = router;
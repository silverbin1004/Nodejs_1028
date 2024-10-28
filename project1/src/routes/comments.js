const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {body, validationResult} = require('express-validator');
const CustomError = require('../utils/CustomError');

router.post('/:postId', authenticate,[
  body('content').isLength({min:5}).withMessage('Content must be at least 5 characters')
], async (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next(new CustomError('Validation Failed', 400));
  }
  try{
    const {content} = req.body;
    const comment = await comment.create({
      content,
      author: req.user.id,
      post: req.params.postId
    });
    res.status(201).json(comment);
  }catch(err){
    next(err);
  }
});

router.put('/:id', authenticate, async(req,res,next)=>{
  try{
    const comment = await Comment.findById(req.params.id);
    if(!comment) {
      return next(new CustomError('Comment not found', 404));
    }
    if(comment.author.toString() !== req.user.id && req.user.role !== 'Admin'){
      return next(new CustomError('Unauthorized', 403));
    }
    const {content} = req.body;
    comment.content = content || comment.content;
    await comment.save();
    res.json(comment);
  } catch (err){
    next(err);
  }
});

router.delete('/:id', authenticate, authorize(['Admin']), async (req,res,next)=>{
  try{
    const comment = await Comment.findById(req.params.id);
    if(!comment){
      return next(new CustomError('Comment not found', 404));
    }
    await comment.remove();
    res.json({message: 'Comment deleted successfully'});
  } catch(err){
    next(err);
  }
});

module.exports = router;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req,res,next)=>{
  const token = req.headers['authorization'];
  if(!token){
    return res.status(401).json({error: 'No token provided'});
  }
  try {
    const decoded = jwt.verify(token, '123456');
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch(err){
    console.log(token);
    res.status(401).json({error: "Invalid token"});
  }
};
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const helmet = require("helmet");

mongoose.connect('mongodb://localhost:27017',{})
.then(()=> console.log('MongoDB connected'))
.catch((err)=> console.error(err));

app.use(helmet());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

app.use((err,req,res,next)=>{
  console.error(`${err.message} - ${req.method} ${req.url}`);
  res.status(err.statusCode || 500).json({error: err.message || "Internal Server Error"});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
});
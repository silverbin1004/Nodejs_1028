const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const CustomError = require("../utils/CustomError");

// 사용자 등록
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 5 })
      .withMessage("Username must be at least 5 characters"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new CustomError("Validation Failed", 400));
    }

    try {
      const { username, password } = req.body;

      const user = new User({ username, password });

      await user.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      next(err);
    }
  }
);

// 사용자 로그인
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return next(new CustomError("Invalid credentials", 401));
    }
    const token = jwt.sign({ id: user._id }, "123456", {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
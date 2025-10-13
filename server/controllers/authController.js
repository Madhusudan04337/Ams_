const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/userSchema")

const JWT_SECRET = process.env.JWT_SECRET || "key_is_secret"

async function register(req, res) {
  try {
    const { username, email, password, role } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User is already exist !" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newuser = new User({ username, email, password: hashedPassword, role })
    await newuser.save()
    res.status(201).json({ message: "User registered successfully!" })
  } catch (err) {
    console.log("error adding user", err)
    res.status(500).json({ message: "Server error. please try again later." })
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." })
    }
    const ispassword = await bcrypt.compare(password, user.password)
    if (!ispassword) {
      return res.status(401).json({ message: "Invalid username or password." })
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" })
    res.status(200).json({ message: "Login successful!", token })
  } catch (err) {
    console.log("Login error:", err)
    res.status(500).json({ message: "Server error during login." })
  }
}

async function myProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "user not found!" })
    }
    res.json({
      message: "This is my Profile",
      username: user.username,
      email: user.email,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error." })
  }
}

function adminWelcome(req, res) {
  res.json({ message: `Welcome Admin ${req.user.username}` })
}
function managerWelcome(req, res) {
  res.json({ message: `Welcome Manager ${req.user.username}` })
}
function employeeWelcome(req, res) {
  res.json({ message: `Welcome Employee ${req.user.username}` })
}

module.exports = {
  register,
  login,
  myProfile,
  adminWelcome,
  managerWelcome,
  employeeWelcome,
}

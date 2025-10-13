const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const { connectDB } = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const attendanceRoutes = require("./routes/attendanceRoutes")

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

connectDB()

app.use("/", authRoutes)
app.use("/attendance", attendanceRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`)
})

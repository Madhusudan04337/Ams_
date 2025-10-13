const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "manager", "employee"],
        default: "employee"
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
})
module.exports = mongoose.model("User", userSchema);

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");

const User = require("./models/userSchema");
const Attendance = require("./models/attendanceSchema");
const AuditLog = require("./models/auditLogSchema");

connectDB();

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "key_is_secret";

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided." });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token." });
    }
};

const roleAuth = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You don't have permission." });
        }
        next();
    };
};

function normalizeToDateOnly(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function monthRange(year, month) {
    const start = new Date(year, month - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
}

app.get("/", (req, res) => {
    res.send("Attendance API is ready.");
});

app.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: "This user already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: "New user created." });
    } catch (err) {
        res.status(500).json({ message: "Could not create user." });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Wrong username or password." });
        }
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful.", token });
    } catch (err) {
        res.status(500).json({ message: "Could not log in." });
    }
});

app.get("/myprofile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ message: "Your Profile", user });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

app.put('/profile/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "You cannot do this." });
        }
        const updates = req.body;
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
        res.json({ message: "Profile updated.", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

app.post("/attendance/mark", auth, roleAuth(["employee"]), async (req, res) => {
    try {
        const userId = req.user.id;
        const today = normalizeToDateOnly(new Date());
        const status = req.body.status || "present";
        if (!["present", "absent", "on_leave"].includes(status)) {
            return res.status(400).json({ message: "Invalid status." });
        }
        if (await Attendance.findOne({ user: userId, date: today })) {
            return res.status(400).json({ message: "Attendance already marked." });
        }
        const record = await Attendance.create({ user: userId, date: today, status });
        res.status(201).json({ message: "Attendance marked.", attendance: record });
    } catch (err) {
        res.status(500).json({ message: "Server error." });
    }
});

app.get("/attendance/history", auth, roleAuth(["employee"]), async (req, res) => {
    try {
        const records = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
        return res.json({ history: records });
    } catch (err) {
        res.status(500).json({ message: "Server error." });
    }
});

app.get('/attendance/:userId', auth, roleAuth(['admin', 'manager']), async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.role === "manager") {
            const targetUser = await User.findById(userId).select("managerId");
            if (!targetUser || String(targetUser.managerId) !== String(req.user.id)) {
                return res.status(403).json({ message: "You can only see your team's attendance." });
            }
        }
        const records = await Attendance.find({ user: userId }).sort({ date: -1 });
        res.json({ attendance: records });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

app.put('/attendance/:attendanceId', auth, roleAuth(['admin', 'manager']), async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { newStatus } = req.body;
        const record = await Attendance.findById(attendanceId);
        if (!record) {
            return res.status(404).json({ message: "Attendance record not found." });
        }
        if (req.user.role === "manager") {
            const targetUser = await User.findById(record.user).select("managerId");
            if (!targetUser || String(targetUser.managerId) !== String(req.user.id)) {
                return res.status(403).json({ message: "You can only change your team's attendance." });
            }
        }
        const previousStatus = record.status;
        record.status = newStatus;
        record.rectifiedBy = req.user.id;
        await record.save();
        await AuditLog.create({ action: "update", performedBy: req.user.id, targetUser: record.user, attendanceDate: record.date, previousStatus, newStatus });
        res.json({ message: "Attendance updated.", record });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
});

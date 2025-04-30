require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
  })
);
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema(
  {
    username: String,
    slackId: String,
    sickLeave: Number,
    restrictedHoliday: Number,
    burnout: Number,
    mensuralLeaves: Number,
    casualLeave: Number,
    maternityLeave: Number,
    unpaidLeave: Number,
    paternityLeave: Number,
    bereavementLeave: Number,
  },
  { collection: "users" }
);

const User = mongoose.model("User", userSchema);

const leaveSchema = new mongoose.Schema(
  {
    user: String,
    dates: { type: [Date], required: true },
    reason: String,
    status: { type: String, default: "Pending" },
    leaveType: { type: String, required: true },
    leaveDay: { type: [String], required: true },
    leaveTime: { type: [String], required: true },
  },
  { timestamps: true, collection: "leaves" }
);

const Leave = mongoose.model("Leave", leaveSchema, "leaves");

// API Routes
app.get("/api/leaves", async (req, res) => {
  try {
    const leaves = await Leave.find();
    const users = await User.find();

    // Create a map of slackId to user details
    const userMap = users.reduce((acc, user) => {
      acc[user.slackId] = {
        username: user.username,
        leaveBalance: {
          sickLeave: user.sickLeave,
          restrictedHoliday: user.restrictedHoliday,
          burnout: user.burnout,
          mensuralLeaves: user.mensuralLeaves,
          casualLeave: user.casualLeave,
          maternityLeave: user.maternityLeave,
          unpaidLeave: user.unpaidLeave,
          paternityLeave: user.paternityLeave,
          bereavementLeave: user.bereavementLeave,
        },
      };
      return acc;
    }, {});

    // Add username and leave balance to each leave
    const leavesWithUserDetails = leaves.map((leave) => ({
      ...leave.toObject(),
      username: userMap[leave.user]?.username || leave.user,
      leaveBalance: userMap[leave.user]?.leaveBalance || {},
    }));

    res.json(leavesWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/leaves/:id", async (req, res) => {
  try {
    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedLeave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

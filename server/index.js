require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 1099;

app.use(cors());

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

const totalLeaves = {
  sickLeave: 12,
  casualLeave: 6,
  burnout: 6,
  mensuralLeaves: 18,
  unpaidLeave: 20,
  internshipLeave: 10,
  wfhLeave: 10,
  bereavementLeave: 5,
  maternityLeave: 13,
  paternityLeave: 20,
  restrictedHoliday: 6,
};

// API Routes
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    const leaves = await Leave.find({ status: "Approved" });

    // Create a map of user leaves
    const userLeavesMap = leaves.reduce((acc, leave) => {
      if (!acc[leave.user]) {
        acc[leave.user] = {};
      }
      if (!acc[leave.user][leave.leaveType]) {
        acc[leave.user][leave.leaveType] = 0;
      }
      // Count each day in the leave period
      acc[leave.user][leave.leaveType] += leave.dates.length;
      return acc;
    }, {});

    // Calculate remaining leaves for each user based on their current balances
    const usersWithRemainingLeaves = users.map((user) => {
      const usedLeaves = userLeavesMap[user.slackId] || {};
      const currentBalances = {
        sickLeave: user.sickLeave || 0,
        casualLeave: user.casualLeave || 0,
        burnout: user.burnout || 0,
        mensuralLeaves: user.mensuralLeaves || 0,
        unpaidLeave: user.unpaidLeave || 0,
        internshipLeave: user.internshipLeave || 0,
        wfhLeave: user.wfhLeave || 0,
        bereavementLeave: user.bereavementLeave || 0,
        maternityLeave: user.maternityLeave || 0,
        paternityLeave: user.paternityLeave || 0,
        restrictedHoliday: user.restrictedHoliday || 0,
      };

      return {
        ...user.toObject(),
        currentBalances,
        remainingLeaves: {
          sickLeave: totalLeaves.sickLeave - currentBalances.sickLeave,
          casualLeave: totalLeaves.casualLeave - currentBalances.casualLeave,
          burnout: totalLeaves.burnout - currentBalances.burnout,
          mensuralLeaves:
            totalLeaves.mensuralLeaves - currentBalances.mensuralLeaves,
          unpaidLeave: totalLeaves.unpaidLeave - currentBalances.unpaidLeave,
          internshipLeave:
            totalLeaves.internshipLeave - currentBalances.internshipLeave,
          wfhLeave: totalLeaves.wfhLeave - currentBalances.wfhLeave,
          bereavementLeave:
            totalLeaves.bereavementLeave - currentBalances.bereavementLeave,
          maternityLeave:
            totalLeaves.maternityLeave - currentBalances.maternityLeave,
          paternityLeave:
            totalLeaves.paternityLeave - currentBalances.paternityLeave,
          restrictedHoliday:
            totalLeaves.restrictedHoliday - currentBalances.restrictedHoliday,
        },
        totalLeaves,
        usedLeaves,
      };
    });

    res.json(usersWithRemainingLeaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

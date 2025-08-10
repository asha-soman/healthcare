const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    },
    startTime: { type: String, required: true },
    endTime:   { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);

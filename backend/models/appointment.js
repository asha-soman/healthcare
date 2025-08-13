const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    slotId:    { type: mongoose.Schema.Types.ObjectId, ref: "Availability", required: true, index: true },
    doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reason:    { type: String, default: "" },
    status:    { type: String, enum: ["booked", "cancelled", "completed"], default: "booked", index: true }
  },
  { timestamps: true }
);

// ensure only one *active* booking per slot (we allow another if previous was cancelled)
appointmentSchema.index({ slotId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "booked" } });

module.exports = mongoose.model("Appointment", appointmentSchema);

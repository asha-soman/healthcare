const Appointment = require("../models/appointment");
const Availability = require("../models/availability");

const createAppointment = async (req, res) => {
  try {
    const { slotId, reason } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const slot = await Availability.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    const existing = await Appointment.findOne({ slotId, status: "booked" });
    if (existing) return res.status(409).json({ message: "This slot is already booked" });

    const appt = await Appointment.create({
      slotId,
      doctorId: slot.user,
      patientId: req.user._id,
      reason: reason || "",
      status: "booked",
    });

    const populated = await Appointment.findById(appt._id)
      .populate({ path: "slotId", select: "dayOfWeek startTime endTime" })
      .populate({ path: "doctorId", select: "name email" })
      .populate({ path: "patientId", select: "name email" });

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create appointment error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const list = await Appointment.find({ patientId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "slotId", select: "dayOfWeek startTime endTime" })
      .populate({ path: "doctorId", select: "name email" });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const list = await Appointment.find({ doctorId: req.user._id, status: { $ne: "cancelled" } })
      .sort({ createdAt: -1 })
      .populate({ path: "slotId", select: "dayOfWeek startTime endTime" })
      .populate({ path: "patientId", select: "name email" });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (appt.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (appt.status !== "booked") {
      return res.status(400).json({ message: "Only booked appointments can be updated" });
    }
    if (typeof req.body.reason === "string") appt.reason = req.body.reason;

    await appt.save();
    const populated = await Appointment.findById(appt._id)
      .populate({ path: "slotId", select: "dayOfWeek startTime endTime" })
      .populate({ path: "doctorId", select: "name email" })
      .populate({ path: "patientId", select: "name email" });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (appt.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (appt.status !== "booked") {
      return res.status(400).json({ message: "Only booked appointments can be cancelled" });
    }

    appt.status = "cancelled";
    await appt.save();
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointment,
  cancelAppointment,
};

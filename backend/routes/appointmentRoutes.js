const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointment,
  cancelAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/", protect, createAppointment);
router.get("/mine", protect, getMyAppointments);
router.get("/doctor", protect, getDoctorAppointments);
router.put("/:id", protect, updateAppointment);
router.delete("/:id", protect, cancelAppointment);

module.exports = router;

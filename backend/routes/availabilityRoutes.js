const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();


router.get("/", protect, getMyAvailability);


module.exports = router;

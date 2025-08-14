const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
  getOpenAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();


router.post("/", protect, createAvailability);
router.get("/", protect, getMyAvailability);
router.put("/:id", protect, updateAvailability);
router.delete("/:id", protect, deleteAvailability);
router.get("/open", protect, getOpenAvailability);


module.exports = router;

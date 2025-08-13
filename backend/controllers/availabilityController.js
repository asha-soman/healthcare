const Availability = require("../models/availability");

//create availability slot
const createAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ message: "dayOfWeek, startTime, endTime are required" });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ message: "Start Time must be before End Time" });
    }

    const slot = await Availability.create({
      user: req.user._id,
      dayOfWeek,
      startTime,
      endTime,
    });
    res.status(201).json(slot);
  } catch (err) {
    console.error("Error occurred while creating the availability!!!", err); 
    res.status(500).json({ message: err.message });  
  }
};


//get all available slots
const getMyAvailability = async (req, res) => {
  try {
    const slots = await Availability.find({ user: req.user._id }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//update the slot
const updateAvailability = async (req, res) => {
  try {
    const slot = await Availability.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: "Availability not found!!!" });
    if (slot.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { dayOfWeek, startTime, endTime } = req.body;
    if ((startTime && endTime) && startTime >= endTime) {
      return res.status(400).json({ message: "Start Time must be before End Time" });
    }

    if (dayOfWeek) slot.dayOfWeek = dayOfWeek;
    if (startTime) slot.startTime = startTime;
    if (endTime)   slot.endTime   = endTime;

    const updated = await slot.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//delete the slot
const deleteAvailability = async (req, res) => {
  try {
    const slot = await Availability.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: "Availability not found!!!" });
    if (slot.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await slot.deleteOne();
    res.json({ message: "Availability has been removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
};

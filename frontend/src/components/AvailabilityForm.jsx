import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const AvailabilityForm = ({ slots, setSlots, editingSlot, setEditingSlot }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ dayOfWeek: "Monday", startTime: "", endTime: "" });

  useEffect(() => {
    if (editingSlot) {
      setForm({
        dayOfWeek: editingSlot.dayOfWeek,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
      });
    } else {
      setForm({ dayOfWeek: "Monday", startTime: "", endTime: "" });
    }
  }, [editingSlot]);

  const validTimes = (start, end) => !!(start && end && start < end);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validTimes(form.startTime, form.endTime)) {
      return alert("Start time must be before end time.");
    }
    try {
      if (editingSlot) {
        //update logic
        const { data } = await axiosInstance.put(
          `/api/availability/${editingSlot._id}`,
          form,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setSlots(slots.map(s => (s._id === data._id ? data : s)));
      } else {
        //create logic
        const { data } = await axiosInstance.post(
          "/api/availability",
          form,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setSlots([...slots, data]);
      }
      setEditingSlot(null);
      setForm({ dayOfWeek: "Monday", startTime: "", endTime: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save slot.";
      alert(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingSlot ? "Edit Availability" : "Add Availability"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-sm block mb-1">Day</label>
          <select
            value={form.dayOfWeek}
            onChange={(e) => setForm(f => ({ ...f, dayOfWeek: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Start</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">End</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex items-end">
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            {editingSlot ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AvailabilityForm;

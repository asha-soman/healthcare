import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const PatientBookAppointments = () => {
  const { user } = useAuth();
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // derive doctors list from populated slots
  const doctors = useMemo(() => {
    const map = new Map();
    slots.forEach(s => {
      if (s.user) map.set(s.user._id, s.user);
    });
    return Array.from(map.values());
  }, [slots]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dayOfWeek) params.dayOfWeek = dayOfWeek;
      if (doctorId) params.doctorId = doctorId;
      const { data } = await axiosInstance.get("/api/availability/open", {
        headers: { Authorization: `Bearer ${user.token}` },
        params,
      });
      setSlots(data || []);
    } catch {
      alert("Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.token) fetchSlots(); }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSlots();
  };

  const handleBook = async (slotId) => {
    try {
      const { data } = await axiosInstance.post("/api/appointments",
        { slotId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Booked Successfully!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Booking failed";
      alert(msg);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>

      <form onSubmit={handleSearch} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-sm block mb-1">Day</label>
          <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Any</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm block mb-1">Doctor</label>
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Any</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.name || d.email}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">{loading ? "Searching..." : "Search"}</button>
        </div>
      </form>

      {slots.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded">No slots available.</div>
      ) : (
        <div className="space-y-3">
          {slots.map(slot => (
            <div key={slot._id} className="bg-gray-100 p-4 rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{slot.user?.name || slot.user?.email}</div>
                <div className="text-sm text-gray-700">{slot.dayOfWeek} • {slot.startTime} — {slot.endTime}</div>
              </div>
              <button onClick={() => handleBook(slot._id)} className="px-4 py-2 bg-green-600 text-white rounded">
                Book
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientBookAppointments;

import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const AvailabilityList = ({ slots, setSlots, setEditingSlot }) => {
  const { user } = useAuth();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this availability slot?")) return;
    try {
      await axiosInstance.delete(`/api/availability/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSlots(slots.filter(s => s._id !== id));
    } catch {
      alert("Failed to delete slot.");
    }
  };

  return (
    <div>
      {slots.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded">No availability yet.</div>
      ) : (
        slots.map(slot => (
          <div key={slot._id} className="bg-gray-100 p-4 mb-4 rounded shadow flex items-center justify-between">
            <div className="font-medium">
              {slot.dayOfWeek}: {slot.startTime} — {slot.endTime}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingSlot(slot)}
                className="px-3 py-2 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(slot._id)}
                className="px-3 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AvailabilityList;

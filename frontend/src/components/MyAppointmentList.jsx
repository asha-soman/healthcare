import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const MyAppointmentList = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [reasonDraft, setReasonDraft] = useState("");

  const load = async () => {
    try {
      const { data } = await axiosInstance.get("/api/appointments/mine", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAppts(data || []);
    } catch {
      alert("Failed to load appointments");
    }
  };

  useEffect(() => { if (user?.token) load(); }, [user]);

  const startEdit = (a) => { setEditingId(a._id); setReasonDraft(a.reason || ""); };
  const cancelEdit = () => { setEditingId(null); setReasonDraft(""); };

  const saveReason = async (id) => {
    try {
      const { data } = await axiosInstance.put(`/api/appointments/${id}`, { reason: reasonDraft }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAppts(appts.map(x => x._id === id ? data : x));
      cancelEdit();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update");
    }
  };

  const cancelAppt = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await axiosInstance.delete(`/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // cancel appointment
      setAppts(appts.map(x => x._id === id ? { ...x, status: "cancelled" } : x));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <div className="space-y-3">
      {appts.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded">No appointments yet.</div>
      ) : appts.map(a => (
        <div key={a._id} className="bg-gray-100 p-4 rounded shadow">
          <div className="flex justify-between">
            <div>
              <div className="font-semibold">{a.doctorId?.name || a.doctorId?.email}</div>
              <div className="text-sm text-gray-700">
                {a.slotId?.dayOfWeek} • {a.slotId?.startTime} — {a.slotId?.endTime}
              </div>
              <div className="text-sm mt-1">
                <span className="font-medium">Status:</span> {a.status}
              </div>
            </div>
            <div className="flex items-start gap-2">
              {a.status === "booked" && (
                <>
                  {editingId === a._id ? (
                    <>
                      <button onClick={() => saveReason(a._id)} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
                      <button onClick={cancelEdit} className="px-3 py-2 bg-gray-500 text-white rounded">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(a)} className="px-3 py-2 bg-yellow-600 text-white rounded">Edit Reason</button>
                      <button onClick={() => cancelAppt(a._id)} className="px-3 py-2 bg-red-600 text-white rounded">Cancel</button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-3">
            {editingId === a._id ? (
              <textarea
                className="w-full p-2 border rounded"
                value={reasonDraft}
                onChange={e => setReasonDraft(e.target.value)}
                rows={2}
                placeholder="Reason for visit (optional)"
              />
            ) : (
              <div className="text-sm"><span className="font-medium">Reason:</span> {a.reason || "—"}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyAppointmentList;

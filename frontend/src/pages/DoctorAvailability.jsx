import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";
import AvailabilityForm from "../components/AvailabilityForm";
import AvailabilityList from "../components/AvailabilityList";

const DoctorAvailability = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const { data } = await axiosInstance.get("/api/availability", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSlots(data || []);
      } catch {
        alert("Failed to fetch availability.");
      }
    };
    if (user?.token) fetchSlots();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <AvailabilityForm
        slots={slots}
        setSlots={setSlots}
        editingSlot={editingSlot}
        setEditingSlot={setEditingSlot}
      />
      <AvailabilityList
        slots={slots}
        setSlots={setSlots}
        setEditingSlot={setEditingSlot}
      />
    </div>
  );
};

export default DoctorAvailability;

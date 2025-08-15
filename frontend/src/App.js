import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import DoctorAvailability from './pages/DoctorAvailability';
import PatientBookAppointments from './pages/PatientBookAppointments';
import MyAppointments from './pages/MyAppointments';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        {/* <Route path="/tasks" element={<Tasks />} /> */}
        <Route path="/doctor/availability" element={<DoctorAvailability />} />
        <Route path="/book" element={<PatientBookAppointments />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
      </Routes>
    </Router>
  );
}

export default App;

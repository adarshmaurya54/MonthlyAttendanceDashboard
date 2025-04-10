import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StudentList from "./pages/StudentList"; // Create this file next
import AttendanceForm from "./pages/AttendanceForm"; // Create this too
import Layout from "./components/Layout";
import AttendanceDashboard from "./pages/AttendanceDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout Route with nested pages */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="students" element={<StudentList />} />
          <Route path="mark-attendance" element={<AttendanceForm />} />
          <Route path="attendance-dashboard/:enrollment" element={<AttendanceDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

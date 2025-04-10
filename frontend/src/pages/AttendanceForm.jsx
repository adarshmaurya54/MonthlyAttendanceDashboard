import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../services/apiService";

const AttendanceForm = () => {
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marked, setMarked] = useState(false);

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const isSunday = new Date().getDay() === 0;

  // Fetch all students
  const getAllStudents = async () => {
    try {
      const { data } = await API.get("/students/");
      setStudents(data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch today's attendance
  const getTodayAttendance = async () => {
    try {
      const { data } = await API.get(`/attendance/today?date=${today}`);
      if (data && data.records) {
        const mapped = {};

        data.records.forEach((record, i) => {
          mapped[record.student.enrollment] = record.status;
        });
        setAttendance(mapped);
        setMarked(true);
      }
    } catch (error) {
      console.log("No attendance found for today (yet).");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getAllStudents();
      await getTodayAttendance();
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCheckboxChange = (enrollment) => {
    setAttendance((prev) => ({
      ...prev,
      [enrollment]: !prev[enrollment],
    }));
  };

  const handleSubmit = async () => {
    const dataToSubmit = Object.entries(attendance).map(([enrollment, present]) => ({
      enrollment,
      present,
    }));

    try {
      await API.post("/attendance/mark", {
        date: today,
        records: dataToSubmit,
      });
      alert("Attendance marked successfully!");
      setMarked(true);
    } catch (err) {
      console.error(err);
      alert("Error marking attendance.");
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  if (isSunday) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-3xl font-semibold text-gray-700">
        Today is Sunday. No attendance is required.
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white p-6 pt-20">
      <h1 className="text-2xl font-bold mb-6">
        {marked ? "Today's Attendance (Already Marked)" : "Mark Attendance for Today"}
      </h1>
      <div className="relative h-[370px] border overflow-x-auto shadow-md sm:rounded-2xl p-2">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 rounded-s-lg">#</th>
              <th className="px-4 py-3">Enrollment</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 rounded-e-lg">Present</th>
            </tr>
          </thead>
          <tbody>
            {students?.map((student, index) => (
              <tr key={student.enrollment} className="bg-white border-b">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{student.enrollment}</td>
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    disabled={marked}
                    checked={attendance[student.enrollment] || false}
                    onChange={() => handleCheckboxChange(student.enrollment)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!marked && (
        <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Submit Attendance
        </button>
      )}
    </div>
  );
};

export default AttendanceForm;

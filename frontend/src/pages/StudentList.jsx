import React, { useEffect, useState } from "react";
import { API } from "../services/apiService";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const StudentList = () => {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendanceSummary, setAttendanceSummary] = useState(null)
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonthName = monthNames[new Date().getMonth()];

  const getAllStudents = async () => {
    const toastId = toast.loading("Please wait...")
    try {
      setLoading(true);
      const { data } = await API.get("/students/");
      setStudents(data.students);
      toast.success("Data fetched !", {id: toastId})
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Error!", {id: toastId})
      setError("Failed to load student data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const getMonthlyAttendanceSummary = async () => {
    try {
      const { data } = await API.get(`/attendance/month-summary?month=2025-04`);
      setAttendanceSummary(data.summary);
    } catch (error) {
      console.error("Error fetching students:", err);
    }
  }
  useEffect(() => {
    getAllStudents();
    getMonthlyAttendanceSummary()
  }, []);
  
  return (
    <div className="min-h-screen bg-white p-6 pt-20">
      <h1 className="text-2xl font-bold mb-6">Student List</h1>

      {/* Loading state */}
      {loading && (
        <div className="text-center text-blue-600 font-medium">
          Loading students...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center text-red-500 font-medium mb-4">
          {error}
        </div>
      )}

      {/* Table content */}
      {!loading && !error && (
        <div className="relative h-[400px] border overflow-x-auto shadow-md sm:rounded-2xl p-2">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 rounded-s-lg">#</th>
                <th scope="col" className="px-6 py-3">Enrollment No</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Month</th>
                <th scope="col" className="px-6 py-3">Present Days</th>
                <th scope="col" className="px-6 py-3">Absent Days</th>
                <th scope="col" className="px-6 py-3 rounded-e-lg">View Details</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((student, index) => (
                <tr
                  key={student.enrollment}
                  className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {index + 1}
                  </th>
                  <td className="px-6 py-4">{student.enrollment}</td>
                  <td className="px-6 py-4">{student.name}</td>
                  <td className="px-6 py-4">{currentMonthName}</td>
                  <td className="px-6 py-4">{attendanceSummary && attendanceSummary[index]?.totalPresent}</td>
                  <td className="px-6 py-4">{attendanceSummary && attendanceSummary[index]?.totalAbsent}</td>
                  <td className="px-6 py-4">
                    <Link className="text-blue-500 hover:underline" to={`/attendance-dashboard/${student.enrollment}`}>
                      Dashboard
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentList;

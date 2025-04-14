import React, { useEffect, useState } from "react";
import { API } from "../services/apiService";
import { useParams } from "react-router-dom";

function AttendanceDashboard() {
  const { enrollment } = useParams();
  const [attendanceMap, setAttendanceMap] = useState(new Map());
  const [studentName, setStudentName] = useState('')
  const [studentEnrollment, setStudentEnrollment] = useState('')

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch student attendance for current month
  const getStudentsAttendance = async () => {
    try {
      const { data } = await API.get(`/attendance/${enrollment}`);
      const statusMap = new Map();

      data.records.forEach((record) => {
        const date = new Date(record.date).getDate(); // extract day only
        statusMap.set(date, record.status); // status: "Present" or "Absent"
      });
      setStudentName(data.name)
      setStudentEnrollment(data.enrollment)
      setAttendanceMap(statusMap);
    } catch (error) {
      console.error("Error fetching attendance", error);
    }
  };

  useEffect(() => {
    getStudentsAttendance();
  }, []);

  // Build calendar cells
  const calendarCells = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      today.getMonth() === month &&
      today.getFullYear() === year;

    const status = attendanceMap.get(day); // get status from map

    calendarCells.push(
      <div
        key={day}
        className={`md:border rounded-2xl flex flex-col items-center justify-center h-20 md:h-24 md:shadow-sm p-1 md:p-2 ${isToday ? "bg-sky-600 text-white font-bold" : "bg-white"
          }`}
      >
        <div className="text-lg">{day}</div>
        {status && (
          <span
            className={`text-xs mt-1 font-semibold rounded-full px-2 py-0.5 
      ${status === "Present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} 
      md:text-sm md:px-3 md:py-1 md:rounded-lg`}
          >
            {/* Display full status for devices larger than md, and abbreviated for smaller devices */}
            <span className="hidden md:inline">{status}</span>
            <span className="inline md:hidden">
              {status === "Present" ? "P" : "A"}
            </span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen md:px-6 bg-white pt-20">
      <h2 className="p-4 md:p-0 text-xl md:text-2xl mb-6 md:mb-10">
        Attendance Calendar -{" "}
        {today.toLocaleString("default", { month: "long" })} {year}{" "}
        (for <span className="font-semibold">{studentName}</span>)
      </h2>

      <div className="md:border my-5 rounded-3xl md:p-10">
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs md:text-sm font-semibold text-gray-700">
          {daysOfWeek.map((day) => (
            <div key={day} className="min-w-0 truncate">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells}
        </div>
      </div>
    </div>
  );
}

export default AttendanceDashboard;

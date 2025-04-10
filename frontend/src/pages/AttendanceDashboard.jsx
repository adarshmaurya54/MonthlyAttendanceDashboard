import React, { useEffect, useState } from "react";
import { API } from "../services/apiService";
import { useParams } from "react-router-dom";

function AttendanceDashboard() {
  const { enrollment } = useParams();
  const [attendanceMap, setAttendanceMap] = useState(new Map());

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
        className={`border rounded-lg flex flex-col items-center justify-center h-24 shadow-sm p-2 ${
          isToday ? "bg-indigo-600 text-white font-bold" : "bg-white"
        }`}
      >
        <div className="text-lg">{day}</div>
        {status && (
          <span
            className={`text-xs mt-1 font-semibold rounded-full px-2 py-0.5 ${
              status === "Present"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white pt-20">
      <h2 className="text-2xl font-bold mb-4">
        Attendance Calendar –{" "}
        {today.toLocaleString("default", { month: "long" })} {year}
      </h2>

      <div className="px-10">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-semibold text-gray-700">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">{calendarCells}</div>
      </div>
    </div>
  );
}

export default AttendanceDashboard;

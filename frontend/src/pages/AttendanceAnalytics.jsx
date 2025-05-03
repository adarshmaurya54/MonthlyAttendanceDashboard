import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { API } from '../services/apiService';

ChartJS.register(ArcElement, Tooltip, Legend);

const getMonthOptions = () => {
  const months = [];
  const today = new Date();
  const year = today.getFullYear();

  for (let m = today.getMonth(); m >= 0; m--) {
    const month = (m + 1).toString().padStart(2, '0');
    months.push(`${year}-${month}`);
  }

  return months;
};

const AttendanceAnalytics = () => {
  const [enrollment, setEnrollment] = useState('');
  const [month, setMonth] = useState('');
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const [avgAttendance, setAvgAttendance] = useState(null);

  const fetchData = async () => {
    try {
      const response = await API.get(`/attendance/${enrollment}/${month}`);
      const records = response.data.records || [];

      let present = 0;
      let absent = 0;
      let noMarked = 0;

      records.forEach(rec => {
        if (rec.status === "Present") present++;
        else if (rec.status === "Absent") absent++;
        else noMarked++; // Treating as Sunday or no class
      });

      const totalMarkedDays = present + absent;
      const avg = totalMarkedDays > 0 ? ((present / totalMarkedDays) * 100).toFixed(2) : '0.00';

      const data = {
        labels: ['Present', 'Absent', 'Sundays / No Class'],
        datasets: [
          {
            label: 'Attendance Summary',
            data: [present, absent, noMarked],
            backgroundColor: ['#10b981', '#ef4444', '#9ca3af'], // green, red, gray
            borderWidth: 1,
          },
        ],
      };

      setChartData(data);
      setAvgAttendance(avg);
      setError('');
    } catch (err) {
      setChartData(null);
      setAvgAttendance(null);
      setError('Failed to fetch attendance data.');
    }
  };

  // Whenever the enrollment or month changes, fetch data again
  useEffect(() => {
    if (enrollment && month) {
      fetchData();
    }
  }, [month, enrollment]);


  return (
    <div className="flex flex-col justify-center items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Monthly Attendance Analytics</h1>

      <form className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <input
          type="text"
          placeholder="Enrollment Number"
          value={enrollment}
          onChange={e => setEnrollment(e.target.value)}
          className="border border-gray-300 transition-all focus:ring-2 ring-black ring-offset-2 focus:outline-none p-2 rounded-xl w-full"
          required
        />
        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border border-gray-300 transition-all focus:ring-2 ring-black ring-offset-2 focus:outline-none p-2 rounded-xl w-full"
          required
        >
          <option value="">Select Month</option>
          {getMonthOptions().map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </form>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {chartData && (
        <div className="bg-white border h-fit w-[500px] rounded-3xl p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">Attendance Distribution (Pie Chart)</h2>
          <Pie data={chartData} />
          {avgAttendance !== null && (
            <p className="text-center mt-4 text-lg font-medium">
              Average Attendance: <span className="text-blue-600">{avgAttendance}%</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceAnalytics;

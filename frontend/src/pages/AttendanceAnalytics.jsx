import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { API } from '../services/apiService';
import { FaAngleDown } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
  const [stdName, setStdName] = useState('');
  const [barOptions, setBarOptions] = useState(null)
  const [monthlySummaryOverallAttendance, setMonthlySummaryOverallAttendance] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [error, setError] = useState('');
  const [month, setMonth] = useState('')
  const [avgAttendance, setAvgAttendance] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const monthNames = {
    January: '01',
    February: '02',
    March: '03',
    April: '04',
    May: '05',
    June: '06',
    July: '07',
    August: '08',
    September: '09',
    October: '10',
    November: '11',
    December: '12'
  };

  const currentMonthIndex = new Date().getMonth();
  const availableMonths = Object.keys(monthNames).slice(0, currentMonthIndex + 1);

  const fetchData = async () => {
    try {
      const response = await API.get(`/attendance/${enrollment}/${month}`);
      const records = response.data.records || [];
      setStdName(response.data.name)

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
      setAvgAttendance(avg + "%");
      setBarChartData(null)
      setMonthlySummaryOverallAttendance(null)
      setError('');
    } catch (err) {
      setChartData(null);
      setAvgAttendance(null);
      setError('Invalid Enrollment Number !!');
    }
  };
  const fetchOverallAttendance = async () => {
    try {
      const res = await API.get(`/attendance/overall/${enrollment}`);
      const data = res.data;
      setStdName(data.name);

      // Pie chart data (overall present vs absent)
      const pieData = {
        labels: ['Present', 'Absent'],
        datasets: [
          {
            label: 'Total Attendance',
            data: [data.totalPresent, data.totalAbsent],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 1,
          },
        ],
      };

      const months = [];
      const presentList = [];
      const absentList = [];
      const avgList = [];
      console.log(data)
      data.monthlySummary.forEach(month => {
        months.push(month.month);
        presentList.push(month.present);
        absentList.push(month.absent);
        avgList.push(month.attendancePercent);
      });
      // Bar chart data (month-wise summary)
      const barData = {
        labels: months,
        datasets: [
          {
            label: 'Present',
            data: presentList,
            backgroundColor: '#10b981',
          },
          {
            label: 'Absent',
            data: absentList,
            backgroundColor: '#ef4444',
          },
        ],
      };

      const barOptions = {
        scales: {
          y: {
            min: 1,
            max: 31,
            ticks: {
              stepSize: 2, // optional: controls how often labels ap
            },
            title: {
              display: true,
              text: 'Number of Days',
            },
          },
          x: {
            title: {
              display: true,
              text: "Months"
            }
          }
        },
      };

      setBarOptions(barOptions)
      setMonthlySummaryOverallAttendance(data.monthlySummary)
      setChartData(pieData);
      setBarChartData(barData);
      setAvgAttendance(data.averageAttendance);
      setError('');
    } catch (err) {
      console.error(err);
      setChartData(null);
      setBarChartData(null);
      setAvgAttendance(null);
      setError('Invalid Enrollment Number !!');
    }
  };

  useEffect(() => {
    if (enrollment && selectedMonth && selectedMonth !== 'all') {
      fetchData();
    } else if (selectedMonth === 'all') {
      fetchOverallAttendance();
    }
  }, [selectedMonth, enrollment]);


  return (
    <div className="flex flex-col justify-center items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Monthly Attendance Analytics</h1>

      <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <input
          type="number"
          placeholder="Enrollment Number"
          value={enrollment}
          onChange={e => setEnrollment(e.target.value)}
          className="border border-gray-300 transition-all focus:ring-2 ring-black ring-offset-2 focus:outline-none p-2 rounded-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          required
        />

        <div className="relative">
          <button
            onClick={() => { setDropdownOpen(!dropdownOpen); }}
            className="inline-flex justify-between w-full capitalize h-full text-nowrap text-gray-500 items-center gap-2 bg-white px-4 py-2 rounded-xl border text-sm font-semibold"
          >
            {selectedMonth === '' ? 'Select Month' : selectedMonth}
            <FaAngleDown />
          </button>
          {dropdownOpen && <div className="absolute shadow-[0_8px_30px_rgba(0,0,0,0.15)] right-0 mt-2 md:w-48 w-full overflow-hidden bg-white border rounded-xl z-10">
            <div className="p-1 h-[200px] overflow-auto flex flex-col gap-1">
              <div
                onClick={() => {
                  setSelectedMonth('');
                  setDropdownOpen(false);
                }}
                className={`px-4 py-2 font-bold rounded-md text-sm hover:bg-gray-100 cursor-pointer ${selectedMonth === '' && "bg-gray-100"}`}
              >
                Select Month
              </div>
              <div
                onClick={() => {
                  setSelectedMonth('all');
                  setDropdownOpen(false);
                }}
                className={`px-4 py-2 rounded-md text-sm hover:bg-gray-100 cursor-pointer ${selectedMonth === 'all' && "bg-gray-100"}`}
              >
                All
              </div>
              {availableMonths.map((month) => (
                <div
                  key={month}
                  onClick={() => {
                    setSelectedMonth(month);
                    setDropdownOpen(false);
                    setMonth(`2025-${monthNames[month]}`)
                  }}
                  className={`px-4 py-2 rounded-md text-sm hover:bg-gray-100 cursor-pointer ${selectedMonth === month && "bg-gray-100"}`}
                >
                  {month}
                </div>
              ))}
            </div>
          </div>}
        </div>
      </div>

      {error && <p className="text-red-500 text-center font-bold bg-red-50 py-5 px-5 md:px-0 md:w-[500px] rounded-3xl">{error}</p>}

      <div className='flex flex-col md:flex-row items-center gap-4'>
        {chartData && (
          <div className="bg-white border h-fit md:w-full w-[350px] transition-all duration-500 rounded-3xl p-6">
            {!monthlySummaryOverallAttendance && <h2 className="text-2xl capitalize font-semibold text-center mb-4">Attendance Distribution of <spna className="block font-bold">{stdName}</spna>  for the selected month</h2>}
            {monthlySummaryOverallAttendance && (
              <h2 className="text-2xl font-semibold text-center mb-4">
                Attendance Distribution of
                <span className="block font-bold">{stdName}</span>
                <span className="block text-sm font-medium text-gray-600">
                  {monthlySummaryOverallAttendance.length} Month Summary
                </span>
              </h2>
            )}
            <Pie data={chartData} />
            {avgAttendance !== null && !monthlySummaryOverallAttendance && (
              <p className="text-center mt-4 text-lg font-medium">
                Average Attendance: <span className="text-blue-600">{avgAttendance}</span>
              </p>
            )}
            {monthlySummaryOverallAttendance && (
              <p className="text-center mt-4 text-lg font-medium">
                Over all Attendance: <span className="text-blue-600">{avgAttendance}</span>
              </p>
            )}
          </div>
        )}
        {barChartData && (
          <div className="bg-white border h-full w-[350px] md:w-full transition-all duration-500 rounded-3xl p-6 mt-6">
            <h2 className="text-2xl font-semibold text-center mb-4">
              Monthly Attendance Summary of <span className="block font-bold">{stdName}</span>
            </h2>
            <Bar data={barChartData} options={barOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAnalytics;

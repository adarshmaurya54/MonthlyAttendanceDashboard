import React, { useEffect, useState } from "react";
import { API } from "../services/apiService";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaAngleDown } from "react-icons/fa6";
import { TbFileExport } from "react-icons/tb";
import FileDownload from "js-file-download";
import { FaSpinner } from "react-icons/fa";
import { useSelector } from "react-redux";


const StudentList = () => {
  const [searchParams] = useSearchParams();
  const monthName = searchParams.get("month");
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [formattedMonth, setFormattedMonth] = useState("")
  const {user} = useSelector(state => state.auth)
  const navigate = useNavigate();

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
  const currentMonthName = Object.keys(monthNames)[currentMonthIndex];
  const availableMonths = Object.keys(monthNames).slice(0, currentMonthIndex + 1);

  useEffect(() => {
    if (monthName) {
      setSelectedMonth(monthName);
    } else {
      setSelectedMonth(currentMonthName);
    }
    setFormattedMonth(`2025-${monthNames[monthName ? monthName : currentMonthName]}`)
  }, [currentMonthName, monthName]);

  const getAllStudents = async () => {
    const toastId = toast.loading("Please wait...");
    try {
      setLoading(true);
      const { data } = await API.get("/students/");
      setStudents(data.students);
      toast.success("Data fetched!", { id: toastId });
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Error!", { id: toastId });
      setError("Failed to load student data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyAttendanceSummary = async (month = '2025-04') => {
    try {
      const { data } = await API.get(`/attendance/month-summary/${month}`);
      setAttendanceSummary(data.summary);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  useEffect(() => {
    if (formattedMonth !== '')
      getMonthlyAttendanceSummary(formattedMonth);
  }, [formattedMonth]);

  useEffect(() => {
    getAllStudents();
  }, []);
  const downloadAttendance = async (monthParam, format) => {
    const toastId = toast.loading("Exporting attendance...");
    try {
      const [year, month] = monthParam.split("-");

      const monthName = Object.keys(monthNames).find(
        (name) => monthNames[name] === month
      );

      const response = await API.get("/attendance/export-attendance", {
        params: { monthParam, format },
        responseType: "blob",
      });

      // Determine file extension based on format
      let fileExtension = "";
      switch (format) {
        case "excel":
          fileExtension = "xlsx";
          break;
        case "pdf":
          fileExtension = "pdf";
          break;
        case "csv":
          fileExtension = "csv";
          break;
        case "json":
          fileExtension = "json";
          break;
        default:
          fileExtension = "txt"; 
      }
      FileDownload(response.data, `${monthName}-Attendance.${fileExtension}`);
      toast.success("Exported!", { id: toastId });
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Oops!! Error while exporting!", { id: toastId });
    }
  };


  return (
    <div className="bg-white md:px-6 px-3">
      <div className="flex items-center justify-between mb-6">
        <h1 className="md:text-2xl font-bold">Student List</h1>

        <div className="flex items-center gap-3">

          <div className="relative">
            <button
              onClick={() => { setExportOpen(!exportOpen); setDropdownOpen(false) }}
              className="inline-flex items-center text-nowrap gap-2 bg-white px-4 py-2 rounded-lg border text-sm font-semibold text-gray-900"
            >
              Export As
              <TbFileExport />
            </button>
            {exportOpen && user && (
              <div className="absolute shadow-[0_8px_30px_rgba(0,0,0,0.15)] right-0 mt-2 w-48 bg-white border rounded-lg z-10">
                <div className="p-1">
                  <div
                    onClick={() => downloadAttendance(formattedMonth, 'excel')}
                    className="px-4 py-2 rounded-md text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Excel
                  </div>
                  <div
                    onClick={() => downloadAttendance(formattedMonth, 'pdf')}
                    className="px-4 py-2 rounded-md text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    PDF
                  </div>
                  <div
                    onClick={() => downloadAttendance(formattedMonth, 'csv')}
                    className="px-4 py-2 rounded-md text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    CSV
                  </div>
                  <div
                    onClick={() => downloadAttendance(formattedMonth, 'json')}
                    className="px-4 py-2 rounded-md text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    JSON
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => { setDropdownOpen(!dropdownOpen); setExportOpen(false) }}
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border text-sm font-semibold text-gray-900"
            >
              {selectedMonth}
              <FaAngleDown />
            </button>
            {dropdownOpen && (
              <div className="absolute shadow-[0_8px_30px_rgba(0,0,0,0.15)] right-0 mt-2 w-48 bg-white border rounded-lg z-10">
                <div className="p-1">
                  {availableMonths.map((month) => (
                    <div
                      key={month}
                      onClick={() => {
                        navigate(`/students?month=${month}`)
                        setSelectedMonth(month);
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2 rounded-md text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center text-gray-600">
          <FaSpinner className="animate-spin text-5xl mb-4 text-blue-500" />
          <p className="text-xl font-medium">Loading, please wait...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center text-red-500 font-medium mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="relative h-full border overflow-x-auto shadow-md rounded-2xl p-2">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3 rounded-s-lg">#</th>
                <th className="px-6 py-3 text-nowrap">Enrollment No</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3 text-nowrap">Present Days</th>
                <th className="px-6 py-3 text-nowrap">Absent Days</th>
                <th className="px-6 py-3 rounded-e-lg text-nowrap">View Details</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((student, index) => (
                <tr
                  key={student.enrollment}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{student.enrollment}</td>
                  <td className="px-6 py-4">{student.name}</td>
                  <td className="px-6 py-4">{selectedMonth}</td>
                  <td className="px-6 py-4">{attendanceSummary && attendanceSummary[index]?.totalPresent}</td>
                  <td className="px-6 py-4">{attendanceSummary && attendanceSummary[index]?.totalAbsent}</td>
                  <td className="px-6 py-4">
                    <Link className="text-blue-500 hover:underline" to={`/attendance-dashboard/${student.enrollment}/2025-${monthNames[selectedMonth]}`}>
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

import { useEffect, useState } from "react";
import { ToastIcon, toast } from "react-hot-toast";
import { API } from "../services/apiService";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../redux/features/auth/authAction";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaCalendarTimes, FaLock } from 'react-icons/fa';

const AttendanceForm = () => {
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marked, setMarked] = useState(false);
  const { user, token } = useSelector((state) => state.auth)
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch, token]);
  useEffect(() => {
    if (!user) {
      setIsLoggedIn(false)
    }
  }, [token, user, navigate]);

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
          mapped[record.enrollment] = record.status;
        });
        setAttendance(mapped);
        setMarked(true);
      }
    } catch (error) {
      console.log("No attendance found for today (yet).");
      console.error(error)
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

  const handleCheckboxChange = (enrollment, name) => {
    setAttendance((prev) => {
      // If already present, remove it (uncheck)
      if (prev[enrollment]) {
        const updated = { ...prev };
        delete updated[enrollment];
        return updated;
      }
      // If not present, add it (check)
      return {
        ...prev,
        [enrollment]: {
          name: name,
          present: true,
        },
      };
    });
  };



  useEffect(() => {
    console.log(attendance)
  }, [attendance])

  const handleSubmit = async () => {
    const dataToSubmit = Object.entries(attendance).map(([enrollment, info]) => ({
      enrollment,
      name: info.name,
      present: info.present,
    }));

    const toastId = toast.loading("Submitting attendance...")

    try {
      await API.post("/attendance/mark", {
        date: today,
        records: dataToSubmit,
      });
      toast.success("Attendance marked successfully!", { id: toastId });
      setMarked(true);
    } catch (err) {
      console.error(err);
      toast.error("Error marking attendance.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-600">
        <FaSpinner className="animate-spin text-5xl mb-4 text-blue-500" />
        <p className="text-xl font-medium">Loading, please wait...</p>
      </div>
    );
  }

  if (isSunday) {
    return (
      <div className="flex flex-col items-center justify-center bg-blue-50 text-gray-700">
        <FaCalendarTimes className="text-6xl text-blue-400 mb-4" />
        <p className="text-2xl font-semibold">Relax! Today is Sunday.</p>
        <p className="text-lg mt-2 text-gray-500">No attendance is required today.</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="p-5">
      <div className="flex rounded-3xl flex-col p-5 items-center justify-center bg-red-50 text-gray-700">
        <FaLock className="text-6xl text-red-400 mb-4" />
        <p className="text-2xl font-semibold">Access Denied</p>
        <p className="text-lg mt-2 text-gray-500">Please login to continue.</p>
        <a
          href="/login"
          className="mt-4 px-5 py-2 bg-red-500 text-white rounded-xl duration-500 hover:bg-red-600 transition"
        >
          Go to Login
        </a>
      </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white md:p-6 p-3">
      <h1 className="text-2xl mb-6">
        {marked ? "Today's Attendance (Already Marked)" : "Mark Attendance for Today"}
      </h1>
      <div className="relative h-full border overflow-x-auto shadow-md rounded-2xl p-2">
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
                    checked={!!attendance[student.enrollment]} // convert undefined to false
                    onChange={() => handleCheckboxChange(student.enrollment, student.name)}
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
      {marked && (
        <div className="my-5 flex flex-col justify-between items-start">
          <p className="text-gray-400">Total No. of present : <span className="text-gray-900 font-bold">{Object.keys(attendance)?.length}</span></p>
          <p className="text-gray-400">Total No. of absent : <span className="text-gray-900 font-bold">{62 - Object.keys(attendance)?.length}</span></p>
          <p className="text-gray-400">Total No. of students : <span className="text-gray-900 font-bold">62</span></p>
        </div>
      )}
    </div>
  );
};

export default AttendanceForm;

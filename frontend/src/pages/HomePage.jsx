import { useNavigate } from "react-router-dom";
import student from "../assets/students.png"

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center bg-white min-h-screen px-6">
      <div className="flex flex-col md:flex-row w-full max-w-6xl ">
        
        {/* Left Side - Image */}
        <div className="md:w-1/2 w-full h-64 md:h-auto">
          <img
            src={student}
            alt="Attendance"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Content */}
        <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Attendance Dashboard</h2>
          <p className="text-gray-600 mb-6">
            This system helps in efficiently managing student attendance. 
            Teachers can mark daily attendance, view statistics, and ensure smooth record-keeping of all students with just a few clicks.
          </p>
          <button
            onClick={() => navigate("/mark-attendance")}
            className="self-start px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

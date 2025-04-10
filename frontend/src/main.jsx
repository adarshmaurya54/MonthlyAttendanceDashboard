import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Import your components/pages
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StudentList from './pages/StudentList'
import AttendanceForm from './pages/AttendanceForm'
import AttendanceDashboard from './pages/AttendanceDashboard'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'students', element: <StudentList /> },
      { path: 'mark-attendance', element: <AttendanceForm /> },
      { path: 'attendance-dashboard/:enrollment', element: <AttendanceDashboard /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(<>
  <RouterProvider router={router} />
  <Toaster />
</>
)

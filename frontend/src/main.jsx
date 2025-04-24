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
import Login from './pages/Login'
import { Provider } from 'react-redux'
import store from './redux/store'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'students', element: <StudentList /> },
      { path: 'mark-attendance', element: <AttendanceForm /> },
      { path: 'attendance-dashboard/:enrollment/:monthParam', element: <AttendanceDashboard /> },
    ],
  },
  { path: 'login', element: <Login /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
<Provider store={store}>
  <RouterProvider router={router} />
  <Toaster />
</Provider>
)

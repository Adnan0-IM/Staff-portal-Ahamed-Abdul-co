import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import {AuthProvider} from './context/AuthContext'
import { ReportsProvider } from './context/ReportsContext'
import {ToastProvider} from './components/ToastContext'
import StaffPortal from "./pages/StaffPortal"
import Reports from "./pages/Reports"
import Login from "./pages/Login"
// import Dashboard from "./pages/Dashboard"
import Admin from "./pages/Admin"
import Partners from "./pages/Partners"

function App() {
  return (
    <>
      <AuthProvider>
        <ReportsProvider>
          <ToastProvider>
            <Router>
              <Routes>
                {/* Redirect from root to staffportal */}
                <Route path="/" element={<Navigate to="/staffportal" replace />} />
                
                {/* Staff Portal and its child routes */}
                <Route path="/staffportal" element={<StaffPortal />}>
                  <Route index element={<Admin />} />
                  <Route path="login" element={<Login />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="partners" element={<Partners />} />
                </Route>
              </Routes>
            </Router>
          </ToastProvider>
        </ReportsProvider>
      </AuthProvider>
    </>
  )
}

export default App





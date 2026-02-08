import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />

          <Route path="/finance" element={
            <DashboardLayout>
              <Finance />
            </DashboardLayout>
          } />

          <Route path="/projects" element={
            <DashboardLayout>
              <Projects />
            </DashboardLayout>
          } />

          <Route path="/team" element={
            <DashboardLayout>
              <Team />
            </DashboardLayout>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

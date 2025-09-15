import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient and QueryClientProvider
import { SnackbarProvider } from 'notistack'; // Import SnackbarProvider
import useAuthStore from './store/authStore'; // Import zustand store
import theme from './theme'; // Import your custom theme
import CssBaseline from '@mui/material/CssBaseline'; // Import CssBaseline

// Import components
import Layout from './components/layout/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import OTPVerification from './pages/Auth/OTPVerification';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Import pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import HistoryPage from './pages/HistoryPage'; // Import HistoryPage
import AnalyticsPage from './pages/AnalyticsPage'; // Import AnalyticsPage
import Categories from './pages/Categories'; // Import Categories page
import SettingsPage from './pages/SettingsPage';

// import InventoryPage from './pages/InventoryPage'; // Removed redundant InventoryPage

// Create a client
const queryClient = new QueryClient();

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Add CssBaseline */}
        <SnackbarProvider maxSnack={3}>
          <Router>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Products />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <HistoryPage />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <AnalyticsPage />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Categories />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                {/* Removed redundant InventoryPage route */}
                <Route path="*" element={<Navigate to="/login" replace />} /> {/* Default to login */}
              </Routes>
            </LocalizationProvider>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

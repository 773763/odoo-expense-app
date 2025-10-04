// client/src/App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';

// --- Imports for styling ---
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Apni theme import karo
import { SnackbarProvider } from 'notistack'; // Snackbar ke liye
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

function App() {
  return (
    // Wrap everything in ThemeProvider and SnackbarProvider
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <CssBaseline /> {/* Normalizes styles and applies background color from theme */}
        
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Expense Manager
            </Typography>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/signup">Signup</Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}> {/* Add responsive padding */}
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Login />} />
          </Routes>
        </Box>

      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
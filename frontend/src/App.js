import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TPEList from './components/TPEList';
import TPEForm from './components/TPEForm';
import UserManagement from './components/UserManagement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <div className="d-flex flex-column min-vh-100">
                    <Header />
                    <main className="flex-grow-1 bg-light">
                      <div className="container-fluid py-4">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/tpe" element={<TPEList />} />
                          <Route path="/tpe/new" element={<TPEForm />} />
                          <Route path="/tpe/:id" element={<TPEForm />} />
                          <Route
                            path="/users"
                            element={
                              <PrivateRoute adminOnly>
                                <UserManagement />
                              </PrivateRoute>
                            }
                          />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
                    </main>
                    <footer className="bg-dark text-white text-center py-3">
                      <small>TPE Manager © 2024 - All rights reserved</small>
                    </footer>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

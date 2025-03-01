import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'
import Main from './pages/Main'
import Detail from './pages/Detail'
import Admin from './pages/Admin'
import Error from './pages/Error'
import FetchData from './api/FetchData'

function App() {
  let useView = true;
  if (sessionStorage.getItem(FetchData.loginUser) !== null) {
      useView = false;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/detail" element={<Detail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Error />} />
        {/*
        <Route path="/" element={useView ? <Navigate to="/view" /> : <Navigate to="/main" />} />
        <Route path="/detail" element={<Detail />} />
        <Route path="/main" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Error />} />
        */}
      </Routes>
    </Router>
  );
}

export default App;
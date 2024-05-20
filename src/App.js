import React from 'react';
import './App.css';
import Registration from './pages/user/Registration/Registration';
import Login from './pages/user/Login/Login';
import Home from './pages/Home';
import Backendless from 'backendless';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import PasswordReset from "./pages/user/PasswordReset/PasswordReset";
import FileManager from "./pages/user/FileManager/FileManager";
import AfterLogin from "./pages/AfterLogin";
import Profile from "./pages/user/Profile/Profile";

const APP_ID = '4CA8C26E-7769-83A8-FF5C-73044B507A00';
const API_KEY = '5310D9F9-6334-4CB3-AEC7-85B630553455';
Backendless.serverURL = 'https://eu-api.backendless.com';
Backendless.initApp(APP_ID, API_KEY);


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}></Route>
                <Route path="/register" element={<Registration/>}></Route>
                <Route path="/login" element={<Login/>}></Route>
                <Route path="/password-reset" element={<PasswordReset/>}></Route>
                <Route path="/file-manager" element={<FileManager/>}></Route>
                <Route path="/after-login" element={<AfterLogin/>}></Route>
                <Route path="/profile" element={<Profile/>}></Route>
            </Routes>
        </Router>
    );
}

export default App;

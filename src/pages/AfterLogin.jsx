import React from 'react';
import { Link } from "react-router-dom";
import Backendless from "backendless";
import { useNavigate } from "react-router";
import {Button} from "react-bootstrap";

function AfterLogin() {
    const navigate = useNavigate();

    const handleExitClick = () => {
        Backendless.UserService.logout().then(() => navigate('/'));
    };

    return (
        <div className="container">
            <div className="row justify-content-center align-items-center">
                <div className="col-md-6">
                    <h2 className="text-center">Ласкаво просимо на наш сайт!</h2>
                    <div className="text-center mb-4">
                        <Link to="/file-manager" className="btn btn-primary mr-2">Управління файлами</Link>
                        <Link to="/profile" className="btn btn-primary mr-2">Профіль користувача</Link>
                        <Link to="/my-places" className="btn btn-primary mr-2">Мої місця</Link>
                        <Link to="/friends" className="btn btn-primary mr-2">Друзі</Link>
                        <Link to="/feedback" className="btn btn-primary mr-2">Feedback</Link>
                        <Button className="btn btn-danger mr-1" onClick={handleExitClick}>Вийти з системи</Button>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default AfterLogin;

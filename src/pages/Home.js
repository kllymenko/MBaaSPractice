import React from 'react';
import {Link} from "react-router-dom";

function Home() {
    return (
        <div className="container">
            <div className="row justify-content-center align-items-center">
                <div className="col-md-6">
                    <h2 className="text-center">Ласкаво просимо на наш сайт!</h2>
                    <div className="text-center mb-4">
                        <Link to="/register" className="btn btn-primary mr-2">Реєстрація</Link>
                        <Link to="/login" className="btn btn-secondary mr-2">Логін</Link>
                        <Link to="/password-reset" className="btn btn-info">Скинути пароль</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
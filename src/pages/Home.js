import React from 'react';
import {Link} from "react-router-dom";

function Home() {
    return (
        <div className="HomePage">
            <h1>Ласкаво просимо на наш сайт!</h1>
            <Link to="/register">
                <button>Реєстрація</button>
            </Link>
            <Link to="/login">
                <button>Логін</button>
            </Link>
            <Link to="/password-reset">
                <button>Скинути пароль</button>
            </Link>
        </div>
    );
}

export default Home;
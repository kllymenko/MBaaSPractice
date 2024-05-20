import React, {useState} from 'react';
import Backendless from 'backendless';
import {Link} from "react-router-dom";
import {useNavigate} from "react-router";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loginUser = async (email, password) => {
        try {
            return await Backendless.UserService.login(email, password, true);
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await loginUser(email, password);
            navigate('/after-login');
        } catch (error) {
            setError(error.message || 'Щось пішло не так! Спробуйте пізніше!');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="card bg-light">
            <article className="card-body mx-auto" style={{maxWidth: 400}}>
                <h4 className="card-title mt-3 text-center">Вхід в систему</h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            className="form-control"
                            type="email"
                            placeholder="Електронна пошта"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control"
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Авторизація...' : 'Увійти'}
                        </button>
                    </div>
                    <div className="form-group">
                        <Link to="/">
                            <button className="btn btn-primary btn-block">Назад</button>
                        </Link>
                    </div>
                </form>
                {error && <div className="error">{error}</div>}
            </article>
        </div>
    );
};

export default Login;

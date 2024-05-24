import React, {useState} from 'react';
import Backendless from 'backendless';
import {Link} from "react-router-dom";

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(null);

        try {
            await Backendless.UserService.restorePassword(email);
            setMessage('Інструкції з відновлення пароля було відправлено на вашу електронну пошту.');
        } catch (error) {
            setError(error.message || 'Не вдалося відновити пароль. Будь ласка, спробуйте ще раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card bg-light">
            <article className="card-body mx-auto" style={{maxWidth: 400}}>
                <h4 className="card-title mt-3 text-center">Відновлення паролю</h4>
                <form onSubmit={handleReset}>
                    <div className="form-group">
                        <input
                            className="form-control"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Відновлення...' : 'Відновити пароль'}
                        </button>
                    </div>
                    <div className="form-group">
                        <Link to="/">
                            <button className="btn btn-primary btn-block">Назад</button>
                        </Link>
                        {message && <div className="text-center">{message}</div>}
                        {error && <div className="text-center">{error}</div>}
                    </div>
                </form>
            </article>
        </div>
    );
};

export default PasswordReset;

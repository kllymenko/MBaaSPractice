import React, { useState } from 'react';
import Backendless from 'backendless';
import {useNavigate} from "react-router";
import {Link} from "react-router-dom";

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
        <div>
            <Link to="/">
                <button>Назад</button>
            </Link>
            <h2>Відновлення пароля</h2>
            <form onSubmit={handleReset}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Відновлення...' : 'Відновити пароль'}
                </button>
            </form>
            {message && <div className="message">{message}</div>}
            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default PasswordReset;

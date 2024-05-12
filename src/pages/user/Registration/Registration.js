import React, { useState } from 'react';
import Backendless from 'backendless';
import {Link} from "react-router-dom";
import {useNavigate} from 'react-router';

const Registration = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login, setLogin] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [country, setCountry] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const registerUser = async (email, password, login, age, gender, country) => {
        if (age < 5) {
            throw new Error('Вибачте, але вам повинно бути не менше 5 років, щоб зареєструватися.');
        }

        const user = new Backendless.User();
        user.email = email;
        user.password = password;
        user.login = login;
        user.age = age;
        user.gender = gender;
        user.country = country;

        try {
            const work_dir = `/user_files/${user.login}`;
            await Backendless.Files.createDirectory(work_dir)
            const shared_dir = `/user_files/${user.login}/shared_with_me`;
            await Backendless.Files.createDirectory(shared_dir)
            return await Backendless.UserService.register(user);
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await registerUser(email, password, login, age, gender, country);
            navigate('/');
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Link to="/">
                <button>Назад</button>
            </Link>
            <h2>Реєстрація</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Логін:</label>
                    <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Вік:</label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Стать:</label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                    >
                        <option value="">Виберіть стать</option>
                        <option value="male">Чоловіча</option>
                        <option value="female">Жіноча</option>
                    </select>
                </div>
                <div>
                    <label>Країна:</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default Registration;

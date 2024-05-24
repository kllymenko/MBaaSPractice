import React, {useState} from 'react';
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
        <div className="card bg-light">
            <article className="card-body mx-auto" style={{maxWidth: 400}}>
                <h4 className="card-title mt-3 text-center">Створіть акаунт</h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-group input-group">
                        <input
                            className="form-control"
                            placeholder="Електронна адреса"
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group input-group">
                        <input
                            className="form-control"
                            placeholder="Пароль"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control"
                            placeholder="Логін"
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control"
                            placeholder="Вік"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <select
                            className="form-control"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                        >
                            <option value="">Виберіть стать</option>
                            <option value="male">Чоловік</option>
                            <option value="female">Жінка</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control"
                            placeholder="Країна"
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <Link to="/">
                            <button className="btn btn-primary btn-block">Назад</button>
                        </Link>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Реєстрація...' : 'Зареєструватися'}
                        </button>
                    </div>
                    <p className="text-center">Вже маєте акаунт? <Link to="/login">Увійти</Link></p>
                    {error && <div className="error">{error}</div>}
                </form>
            </article>
        </div>
    );
};

export default Registration;

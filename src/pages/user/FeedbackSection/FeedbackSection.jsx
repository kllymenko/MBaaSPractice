import React, {useEffect, useState} from 'react';
import Backendless from 'backendless';
import {Alert} from 'react-bootstrap';
import {Link} from "react-router-dom";

const FeedbackSection = () => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser(true);
            setUser(currentUser);
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };

    const handleSubmit = async () => {
        if (!message.trim() || !type) {
            alert('Будь ласка, введіть повідомлення та виберіть тип.');
            return;
        }

        const feedbackData = {
            message,
            type,
            user: user?.login,
            userEmail: user?.email,
        };

        try {
            await Backendless.Data.of('Feedback').save(feedbackData);
            const bodyParts = new Backendless.Bodyparts({
                textmessage: `Тип: ${type}\n\nПовідомлення:\n${message}\n\nВід: ${user?.login} (${user?.email})`
            });
            await Backendless.Messaging.sendEmail(
                `Feedback`,
                bodyParts,
                ['alexklimovv2@gmail.com']
            );

            setSubmitted(true);
        } catch (error) {
            console.error('Помилка при відправленні зворотнього зв\'язку:', error);
            alert('Сталася помилка. Будь ласка, спробуйте ще раз.');
        }
    };

    return (
        <div>
            {submitted ? (
                <Alert variant="success">
                    Ваше повідомлення успішно відправлено!
                    <Link to="/after-login">
                        <button className="btn btn-primary">Попередня сторінка</button>
                    </Link>
                </Alert>
            ) : (
                <div>
                    <div className="d-flex justify-content-between mb-3">
                        <Link to="/after-login">
                            <button className="btn btn-primary">Попередня сторінка</button>
                        </Link>
                        <h2>Фідбек від користувача: ({user?.login})</h2>
                    </div>
                    <h3>Розробнику</h3>
                    <div className="form-group">
                        <label htmlFor="message">Повідомлення:</label>
                        <textarea
                            id="message"
                            className="form-control"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Тип:</label>
                        <select
                            id="type"
                            className="form-control"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="">Виберіть тип</option>
                            <option value="помилка">Помилка</option>
                            <option value="порада">Порада</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Відправити
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackSection;

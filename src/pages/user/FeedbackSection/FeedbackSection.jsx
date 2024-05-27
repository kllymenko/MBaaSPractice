import React, { useState } from 'react';
import Backendless from 'backendless';
import { Alert } from 'react-bootstrap';

const FeedbackSection = () => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim() || !type) {
            // Валідація: перевірка чи заповнені обов'язкові поля
            alert('Будь ласка, введіть повідомлення та виберіть тип.');
            return;
        }

        const feedbackData = {
            message,
            type,
        };

        try {
            // Відправлення даних про зворотній зв'язок на сервер
            await Backendless.Data.of('Feedback').save(feedbackData);
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
                </Alert>
            ) : (
                <div>
                    <h3>Розробнику (або Feedback)</h3>
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

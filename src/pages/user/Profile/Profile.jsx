import React, { useEffect, useState } from 'react';
import Backendless from 'backendless';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [avatarPath, setAvatarPath] = useState('');
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        login: '',
        email: '',
        // Add other profile fields here if needed
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const currentUser = await Backendless.UserService.getCurrentUser();
            setUser(currentUser);
            setAvatarPath(currentUser.avatar_path);
            setProfileData({
                login: currentUser.login,
                email: currentUser.email,
                // Set other profile fields here if needed
            });
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleProfileUpdate = async () => {
        try {
            const updatedUser = { ...user, ...profileData, avatar_path: avatarPath };
            await Backendless.UserService.update(updatedUser);
            alert('Профіль оновлено успішно');
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        const path = `/user_avatars/${user.login}/${file.name}`;
        try {
            const result = await Backendless.Files.upload(file, path);
            setAvatarPath(result.fileURL); // Save the file URL returned by Backendless
            await handleProfileUpdate(); // Update user profile with the new avatar path
        } catch (error) {
            console.error('Failed to upload avatar:', error);
        }
    };

    const handleExitClick = async () => {
        await Backendless.UserService.logout();
        navigate('/');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between">
                <Link to="/after-login">
                    <button className="btn btn-primary btn-block">Попередня сторінка</button>
                </Link>
                <button className="btn btn-secondary" onClick={handleExitClick}>Вийти з системи</button>
                <h2>Профіль користувача ({user?.login})</h2>
            </div>
            <div className="mt-4">
                <div className="mb-3">
                    <label>Логін</label>
                    <input
                        type="text"
                        className="form-control"
                        name="login"
                        value={profileData.login}
                        onChange={handleProfileChange}
                        readOnly
                    />
                </div>
                <div className="mb-3">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                    />
                </div>
                {/* Add more profile fields here if needed */}
                <div className="mb-3">
                    <label>Завантажити аватар</label>
                    <input
                        type="file"
                        className="form-control-file"
                        accept="image/*" // Дозволяє обрати лише фото
                        onChange={handleAvatarUpload}
                    />
                </div>
                {avatarPath && (
                    <div className="mb-3">
                        <label>Поточний аватар</label>
                        <img
                            src={avatarPath}
                            alt="Avatar"
                            className="img-thumbnail"
                            style={{ width: '150px', height: '150px' }} // Add inline styles for smaller size
                        />
                    </div>
                )}
                <button className="btn btn-success" onClick={handleProfileUpdate}>Оновити профіль</button>
            </div>
        </div>
    );
};

export default Profile;

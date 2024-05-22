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
        age: '',
        country: '',
        gender: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [initialLogin, setInitialLogin] = useState('');
    const [trackLocation, setTrackLocation] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        let locationInterval;
        if (trackLocation) {
            locationInterval = setInterval(() => {
                updateLocation();
            }, 60000);
        }
        return () => {
            if (locationInterval) clearInterval(locationInterval);
        };
    }, [trackLocation]);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const currentUser = await Backendless.UserService.getCurrentUser(true);
            const email = currentUser.email;
            const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`email = '${email}'`);
            const users = await Backendless.Data.of("Users").find(queryBuilder);

            if (users.length > 0) {
                const dbUser = users[0];
                setUser(dbUser);
                setAvatarPath(dbUser.avatar_path || '');
                setProfileData({
                    login: dbUser.login || '',
                    age: dbUser.age || '',
                    country: dbUser.country || '',
                    gender: dbUser.gender || ''
                });
                setInitialLogin(dbUser.login || '');
                setTrackLocation(dbUser.location_access || false);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const updatedUser = { ...user, my_location: new Backendless.Data.Point().setLatitude(latitude).setLongitude(longitude) };
                await Backendless.UserService.update(updatedUser);
            }, (error) => {
                console.error('Failed to get geolocation:', error);
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleTrackLocationChange = async () => {
        const newTrackLocation = !trackLocation;
        setTrackLocation(newTrackLocation);
        const updatedUser = { ...user, location_access: newTrackLocation };
        await Backendless.UserService.update(updatedUser);
    };

    const handleProfileUpdate = async () => {
        try {
            let newAvatarPath = avatarPath;
            if (selectedFile) {
                const path = `/user_avatars/${user.login}/${selectedFile.name}`;
                const result = await Backendless.Files.upload(selectedFile, path);
                newAvatarPath = result.fileURL;

                if (user.avatar_path && !user.avatar_path.includes('default_avatar.png')) {
                    await Backendless.Files.remove(user.avatar_path.replace(Backendless.appPath, ''));
                }
            }
            if (profileData.login && profileData.login !== initialLogin) {
                await Backendless.Files.renameFile(`/user_files/${initialLogin}`, profileData.login);
            }

            const updatedUser = { ...user, ...profileData, avatar_path: newAvatarPath, location_access: trackLocation };
            await Backendless.UserService.update(updatedUser);

            setAvatarPath('');
            setUser('');
            await fetchUserProfile();
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleAvatarUpload = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPath(reader.result);
        };
        reader.readAsDataURL(file);
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
                    />
                </div>
                <div className="mb-3">
                    <label>Вік</label>
                    <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={profileData.age}
                        onChange={handleProfileChange}
                    />
                </div>
                <div className="mb-3">
                    <label>Країна</label>
                    <input
                        type="text"
                        className="form-control"
                        name="country"
                        value={profileData.country}
                        onChange={handleProfileChange}
                    />
                </div>
                <div className="mb-3">
                    <label>Стать</label>
                    <select
                        className="form-control"
                        name="gender"
                        value={profileData.gender}
                        onChange={handleProfileChange}
                    >
                        <option value="">Виберіть стать</option>
                        <option value="male">Чоловік</option>
                        <option value="female">Жінка</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label>
                        <input
                            type="checkbox"
                            checked={trackLocation}
                            onChange={handleTrackLocationChange}
                        />
                        Відслідковувати моє місце розташування
                    </label>
                </div>
                <div className="mb-3">
                    <label>Завантажити аватар</label>
                    <input
                        type="file"
                        className="form-control-file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                    />
                </div>
                {avatarPath && (
                    <div className="mb-3">
                        <img
                            src={avatarPath}
                            alt="Avatar"
                            className="img-thumbnail"
                            style={{ width: '150px', height: '150px' }}
                        />
                    </div>
                )}
                <button className="btn btn-success" onClick={handleProfileUpdate}>Оновити профіль</button>
            </div>
        </div>
    );
};

export default Profile;

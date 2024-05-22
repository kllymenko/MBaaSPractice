import React, { useState, useEffect } from 'react';
import Backendless from 'backendless';

const MyPlaces = () => {
    const [places, setPlaces] = useState([]);
    const [newPlace, setNewPlace] = useState({
        description: '',
        category: '',
        hashtags: '',
        imageUrl: '',
        location: { latitude: null, longitude: null }
    });
    const [currentLocation, setCurrentLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlaces();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCurrentLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            });
        }
    }, []);

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const places = await Backendless.Data.of("Place").find();
            setPlaces(places);
        } catch (error) {
            console.error('Failed to fetch places:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewPlace((prevPlace) => ({
            ...prevPlace,
            [name]: value
        }));
    };

    const handleAddPlace = async () => {
        try {
            if (!newPlace.location.latitude || !newPlace.location.longitude) {
                newPlace.location = currentLocation;
            }
            const addedPlace = await Backendless.Data.of("Place").save(newPlace);
            setPlaces([...places, addedPlace]);
            setNewPlace({
                description: '',
                category: '',
                hashtags: '',
                imageUrl: '',
                location: { latitude: null, longitude: null }
            });
        } catch (error) {
            console.error('Failed to add place:', error);
        }
    };

    const handleDeletePlace = async (placeId) => {
        try {
            await Backendless.Data.of("Place").remove({ objectId: placeId });
            setPlaces(places.filter((place) => place.objectId !== placeId));
        } catch (error) {
            console.error('Failed to delete place:', error);
        }
    };

    const handleSearch = async (searchParams) => {
        // Implement search logic here
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Мої місця</h2>
            <div className="mt-4">
                <div className="mb-3">
                    <label>Опис</label>
                    <input
                        type="text"
                        className="form-control"
                        name="description"
                        value={newPlace.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label>Категорія</label>
                    <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={newPlace.category}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label>Хештеги</label>
                    <input
                        type="text"
                        className="form-control"
                        name="hashtags"
                        value={newPlace.hashtags}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label>Зображення (URL)</label>
                    <input
                        type="text"
                        className="form-control"
                        name="imageUrl"
                        value={newPlace.imageUrl}
                        onChange={handleInputChange}
                    />
                </div>
                <button className="btn btn-success" onClick={handleAddPlace}>Додати місце</button>
            </div>
            <div className="mt-4">
                <h3>Список місць</h3>
                <ul className="list-group">
                    {places.map((place) => (
                        <li className="list-group-item d-flex justify-content-between align-items-center" key={place.objectId}>
                            <div>
                                <h5>{place.description}</h5>
                                <p>Категорія: {place.category}</p>
                                <p>Хештеги: {place.hashtags}</p>
                                <p>Координати: {place.location.latitude}, {place.location.longitude}</p>
                                {place.imageUrl && <img src={place.imageUrl} alt="Place" style={{ width: '150px' }} />}
                            </div>
                            <button className="btn btn-danger" onClick={() => handleDeletePlace(place.objectId)}>Видалити</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MyPlaces;

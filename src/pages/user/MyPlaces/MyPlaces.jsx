import React, {useState, useEffect} from 'react';
import Backendless from 'backendless';
import {Button} from 'react-bootstrap';
import {Link} from "react-router-dom";
import {format} from 'date-fns';
import LeafletMapOnePlace from "../Map/LeafletMapOnePlace";
import {getDistance} from 'geolib';

const MyPlaces = () => {
    const [places, setPlaces] = useState([]);
    const [newPlace, setNewPlace] = useState({
        category: '',
        description: '',
        hashtags: '',
        image: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [photoPath, setPhotoPath] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [user, setUser] = useState(null);
    const [userLikes, setUserLikes] = useState([]);
    const [showMap, setShowMap] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isCustomCategory, setIsCustomCategory] = useState(false);


    useEffect(() => {
        fetchUserPlaces();
        fetchUserLikes();
        fetchUniqueCategories();
    }, []);


    const fetchUniqueCategories = async () => {
        try {
            const allPlaces = await Backendless.Data.of('Place').find();
            const uniqueCategories = [...new Set(allPlaces.map(place => place.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Failed to fetch unique categories:', error);
        }
    };


    const fetchUserPlaces = async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser(true);
            setUser(currentUser);
            const objectId = currentUser.objectId;
            const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`ownerId = '${objectId}'`);
            const userPlaces = await Backendless.Data.of('Place').find(queryBuilder);
            setPlaces(userPlaces);

        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setNewPlace((prevPlace) => ({
            ...prevPlace,
            [name]: value,
        }));
    };

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPath(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAddPlace = async () => {
        if (!user) return;
        if (user.my_location === null) {
            alert('Локація невідома');
            return;
        }
        try {
            let category = newPlace.category;

            if (selectedFile) {
                const path = `/places-photos/${user.login}/${selectedFile.name}`;
                const result = await Backendless.Files.upload(selectedFile, path);
                const placeObject = ({
                    category,
                    coordinates: user.my_location,
                    description: newPlace.description,
                    hashtags: newPlace.hashtags,
                    image: result.fileURL
                });
                await Backendless.Data.of('Place').save(placeObject);
                setNewPlace({
                    category: '',
                    description: '',
                    hashtags: '',
                    image: ''
                });
                setPhotoPath('');
                fetchUserPlaces();
                fetchUniqueCategories(); // Оновити список категорій
            }
        } catch (error) {
            console.error('Failed to add place:', error);
        }
    };


    const handleDeletePlace = async (placeId) => {
        if (!user) return;
        try {
            const place = await Backendless.Data.of('Place').findById(placeId);
            if (place.ownerId === user.objectId) {
                await Backendless.Data.of('Likes').bulkDelete(`placeId = '${placeId}'`)
                await Backendless.Files.remove(place.image);
                await Backendless.Data.of('Place').remove(place);
                setSearchResults([]);
                fetchUserPlaces();
            } else {
                alert('Ви не можете видалити місце іншого користувача');
            }
        } catch (error) {
            console.error('Failed to delete place or likes:', error);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchPlaces = async () => {
        if (!user) return;
        try {
            const whereClause = `description LIKE '%${searchTerm}%' OR category LIKE '%${searchTerm}%'`;
            const queryBuilder = Backendless.DataQueryBuilder.create()
                .setWhereClause(whereClause)
                .setSortBy(['likesCount DESC']);
            const results = await Backendless.Data.of('Place').find(queryBuilder);
            setSearchResults(results);
        } catch (error) {
            console.error('Failed to search places:', error);
        }
    };

    const handleLikePlace = async (currentPlace) => {
        if (!user) return;
        try {
            const likeObject = {
                placeId: currentPlace.objectId,
            };
            await Backendless.Data.of('Likes').save(likeObject);

            // Update likes count
            const place = await Backendless.Data.of('Place').findById(currentPlace.objectId);
            currentPlace.likesCount += 1;
            await Backendless.Data.of('Place').save(currentPlace);
            setUserLikes(prevLikes => [...prevLikes, likeObject]);
            fetchUserPlaces();
        } catch (error) {
            console.error('Failed to like place:', error);
        }
    };

    const fetchUserLikes = async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser(true);
            const userId = currentUser.objectId;
            const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`ownerId = '${userId}'`);
            const likes = await Backendless.Data.of('Likes').find(queryBuilder);
            setUserLikes(likes);
        } catch (error) {
            console.error('Failed to fetch user likes:', error);
        }
    };

    const hasUserLiked = (placeId) => {
        return userLikes.some(like => like.placeId === placeId);
    };

    const openMap = (objectId) => {
        if (showMap === objectId) {
            setShowMap(null);
        } else {
            setShowMap(objectId);
        }
    };


    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between">
                <Link to="/after-login">
                    <button className="btn btn-primary btn-block">Попередня сторінка</button>
                </Link>
                <h2>Місця користувача ({user?.login})</h2>
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    name="description"
                    value={newPlace.description}
                    onChange={handleInputChange}
                    placeholder="Опис"
                />
                <input
                    type="text"
                    className="form-control"
                    name="hashtags"
                    value={newPlace.hashtags}
                    onChange={handleInputChange}
                    placeholder="Хештеги"
                />
                <div className="mb-3">
                    <select
                        className="form-control"
                        name="category"
                        value={newPlace.category}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'new') {
                                setIsCustomCategory(true);
                                setNewPlace(prevPlace => ({...prevPlace, category: ''}));
                            } else {
                                setIsCustomCategory(false);
                                setNewPlace(prevPlace => ({...prevPlace, category: value}));
                            }
                        }}
                    >
                        <option value="">Виберіть категорію</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                        <option value="new">Додати нову категорію</option>
                    </select>
                </div>
                {isCustomCategory && (
                    <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={newPlace.category}
                        onChange={handleInputChange}
                        placeholder="Нова категорія"
                    />
                )}


                <div className="mb-3">
                    <label>Завантажити аватар</label>
                    <input
                        type="file"
                        className="form-control-file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    />
                </div>
                {photoPath && (
                    <div className="mb-3">
                        <img
                            src={photoPath}
                            alt="Photo"
                            className="img-thumbnail"
                            style={{width: '150px', height: '150px'}}
                        />
                    </div>
                )}
                <button className="btn btn-success mt-2" onClick={handleAddPlace}>Додати місце</button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Пошук за описом або категорією"
                />
                <Button className="btn btn-primary mt-2" onClick={handleSearchPlaces}>Знайти</Button>
                <Button className="btn btn-primary mt-2" onClick={() => setSearchResults([])}>Очистити пошук</Button>

            </div>
            <h3>Результати пошуку</h3>
            <div className="row">
                {searchResults.map((place) => (
                    <React.Fragment key={place.objectId}>
                        <div className="col-md-4 mb-3">
                            <img src={place.image} alt={place.description} style={{width: '65%'}}/>
                        </div>
                        <div className="col-md-4 mb-3">
                            <h5>{place.description}</h5>
                            <p>Категорія: {place.category}</p>
                            <p>Хештеги: {place.hashtags}</p>
                            <p>Дата створення: {format(new Date(place.created), 'dd.MM.yyyy')}</p>
                            <p>
                                Дистанція: {user.my_location ? (
                                `${getDistance(
                                    {latitude: user.my_location.y, longitude: user.my_location.x},
                                    {latitude: place.coordinates.y, longitude: place.coordinates.x}
                                )} м`
                            ) : 'Невідома'}
                            </p>
                            <p>Лайків: {place.likesCount}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div>
                                <Button className="mt-2 btn-block" onClick={() => openMap(place.objectId)}>Відкрити/Закрити
                                    мапу</Button>
                                {showMap === place.objectId && <LeafletMapOnePlace place={place}/>}
                            </div>
                            {!hasUserLiked(place.objectId) && (
                                <Button variant="mt-2 btn-block" onClick={() => handleLikePlace(place)}>Лайк</Button>
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </div>
            <h3>Мої місця</h3>
            <div className="row">
                {places.map((place) => (
                    <React.Fragment key={place.objectId}>
                        <div className="col-md-4 mb-3">
                            <img src={place.image} alt={place.description} style={{width: '65%'}}/>
                        </div>
                        <div className="col-md-4 mb-3">
                            <h5>{place.description}</h5>
                            <p>Категорія: {place.category}</p>
                            <p>Хештеги: {place.hashtags}</p>
                            <p>Дата створення: {format(new Date(place.created), 'dd.MM.yyyy')}</p>
                            <p>Лайків: {place.likesCount}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Button className="mt-2 btn-block btn-danger"
                                    onClick={() => handleDeletePlace(place.objectId)}>Видалити</Button>
                            <div>
                                <Button className="mt-2 btn-block" onClick={() => openMap(place.objectId)}>Відкрити/Закрити
                                    мапу</Button>
                                {showMap === place.objectId && <LeafletMapOnePlace place={place}/>}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>


        </div>
    );
};

export default MyPlaces;

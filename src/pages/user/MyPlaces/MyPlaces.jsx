import React, {useState, useEffect} from 'react';
import Backendless from 'backendless';
import {Card, Button} from 'react-bootstrap';

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
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUserPlaces();
    }, []);

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
        try {
            if (selectedFile) {
                const path = `/places-photos/${user.login}/${selectedFile.name}`;
                const result = await Backendless.Files.upload(selectedFile, path);
                const placeObject = ({
                    category: newPlace.category,
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
                await Backendless.Data.of('Place').remove(place);
                fetchUserPlaces();
            } else {
                console.error('You can only delete your own places.');
            }
        } catch (error) {
            console.error('Failed to delete place:', error);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchPlaces = async () => {
        if (!user) return;
        try {
            const whereClause = `description LIKE '%${searchTerm}%' OR category LIKE '%${searchTerm}%'`;
            const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
            const results = await Backendless.Data.of('Place').find(queryBuilder);
            setSearchResults(results);
        } catch (error) {
            console.error('Failed to search places:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Мої місця</h2>
            {/* Форма для додавання місця */}
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
                <input
                    type="text"
                    className="form-control"
                    name="category"
                    value={newPlace.category}
                    onChange={handleInputChange}
                    placeholder="Категорія"
                />
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
                <button className="btn btn-primary mt-2" onClick={handleSearchPlaces}>Знайти</button>
            </div>
            <h3>Результати пошуку</h3>
            <div className="row">
                {searchResults.map((place) => (
                    <div key={place.objectId} className="col-md-4 mb-3">
                        <Card style={{width: '18rem'}}>
                            <Card.Img variant="top" src={place.image}/>
                            <Card.Body>
                                <Card.Title>{place.description}</Card.Title>
                                <Card.Text>{place.hashtags}</Card.Text>
                                <Button variant="danger"
                                        onClick={() => handleDeletePlace(place.objectId)}>Видалити</Button>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Ваші місця */}
            <h3>Мої місця</h3>
            <div className="row">
                {places.map((place) => (
                    <div key={place.objectId} className="col-md-4 mb-3">
                        <Card style={{width: '18rem'}}>
                            <Card.Img variant="top" src={place.image}/>
                            <Card.Body>
                                <Card.Title>{place.description}</Card.Title>
                                <Card.Text>{place.hashtags}</Card.Text>
                                <Button variant="danger"
                                        onClick={() => handleDeletePlace(place.objectId)}>Видалити</Button>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyPlaces;

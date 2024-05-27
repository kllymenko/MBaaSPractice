import React, { useState, useEffect } from 'react';
import Backendless from 'backendless';
import LeafletMapManyPlaces from "../Map/LeafletMapManyPlaces";
import { Link } from "react-router-dom";
import {Button} from "react-bootstrap";

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(null);
    const [sentRequests, setSentRequests] = useState([]);

    useEffect(() => {
        fetchFriends();
        fetchFriendRequests();
        fetchSentRequests();
    }, []);

    const fetchFriends = async () => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        setUser(currentUser);
        const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`userId = '${currentUser.objectId}'`);
        const userFriends = await Backendless.Data.of('Friends').find(queryBuilder);

        const friendIds = userFriends.map(friend => friend.friendId);
        if (friendIds.length > 0) {
            const queryBuilder2 = Backendless.DataQueryBuilder.create().setWhereClause(`objectId IN ('${friendIds.join("','")}')`);
            const friendsList = await Backendless.Data.of('Users').find(queryBuilder2);
            setFriends(friendsList);
        } else {
            setFriends([]);
        }
    };

    const fetchFriendRequests = async () => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`receiverId = '${currentUser.objectId}'`);
        const requests = await Backendless.Data.of('FriendRequests').find(queryBuilder);

        // Fetch sender details for each request
        const requestsWithLogin = await Promise.all(requests.map(async request => {
            const sender = await Backendless.Data.of('Users').findById(request.ownerId);
            return { ...request, senderLogin: sender.login }; // Include sender login
        }));

        setFriendRequests(requestsWithLogin);
    };

    const fetchSentRequests = async () => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`ownerId = '${currentUser.objectId}'`);
        const requests = await Backendless.Data.of('FriendRequests').find(queryBuilder);

        const sentRequestIds = requests.map(request => request.receiverId);
        setSentRequests(sentRequestIds);
    };

    const sendFriendRequest = async (receiverId) => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        const friendRequest = {
            ownerId: currentUser.objectId,
            receiverId: receiverId
        };
        await Backendless.Data.of('FriendRequests').save(friendRequest);
        setSentRequests([...sentRequests, receiverId]);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = async () => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        const friendIds = friends.map(friend => friend.objectId);
        const whereClause = `login LIKE '%${searchTerm}%' AND location_access = true AND objectId != '${currentUser.objectId}' AND objectId NOT IN ('${friendIds.join("','")}')`;
        const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
        const results = await Backendless.Data.of('Users').find(queryBuilder);
        setSearchResults(results);
    };

    const handleAddFriend = async (friendId) => {
        await sendFriendRequest(friendId);
        alert('Запрошення надіслано');
    };

    const acceptFriendRequest = async (senderId) => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        const friend1 = {
            userId: currentUser.objectId,
            friendId: senderId
        };
        const friend2 = {
            userId: senderId,
            friendId: currentUser.objectId
        };
        await Backendless.Data.of('Friends').save(friend1);
        await Backendless.Data.of('Friends').save(friend2);

        // Видалення запиту на дружбу після прийняття
        const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`ownerId = '${senderId}' AND receiverId = '${currentUser.objectId}'`);
        const friendRequests = await Backendless.Data.of('FriendRequests').find(queryBuilder);
        for (let request of friendRequests) {
            await Backendless.Data.of('FriendRequests').remove(request);
        }
    };

    const removeFriend = async (friendId) => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        const queryBuilder1 = Backendless.DataQueryBuilder.create().setWhereClause(`userId = '${currentUser.objectId}' AND friendId = '${friendId}'`);
        const queryBuilder2 = Backendless.DataQueryBuilder.create().setWhereClause(`userId = '${friendId}' AND friendId = '${currentUser.objectId}'`);
        const friends1 = await Backendless.Data.of('Friends').find(queryBuilder1);
        const friends2 = await Backendless.Data.of('Friends').find(queryBuilder2);

        for (let friend of friends1) {
            await Backendless.Data.of('Friends').remove(friend);
        }
        for (let friend of friends2) {
            await Backendless.Data.of('Friends').remove(friend);
        }

        // Оновлення списку друзів після видалення
        setFriends(friends.filter(friend => friend.objectId !== friendId));
    };

    const handleAcceptRequest = async (senderId) => {
        await acceptFriendRequest(senderId);
        fetchFriends();
        fetchFriendRequests();
    };

    const handleRemoveFriend = async (friendId) => {
        await removeFriend(friendId);
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-3">
                <Link to="/after-login">
                    <button className="btn btn-primary">Попередня сторінка</button>
                </Link>
                <h2>Друзі користувача ({user?.login})</h2>
            </div>
            <h3>Мої друзі</h3>
            <ul className="list-group mb-4">
                {friends.map(friend => (
                    <li key={friend.objectId} className="list-group-item d-flex justify-content-between align-items-center">
                        {friend.login}
                        <Button className="btn btn-danger btn-sm" onClick={() => handleRemoveFriend(friend.objectId)}>Видалити</Button>
                    </li>
                ))}
            </ul>
            <FriendsMap friends={friends.filter(friend => friend.location_access)} />

            <h3>Запити в друзі</h3>
            <ul className="list-group mb-4">
                {friendRequests.map(request => (
                    <li key={request.objectId} className="list-group-item d-flex justify-content-between align-items-center">
                        {request.senderLogin}
                        <Button className="btn btn-success btn-sm" onClick={() => handleAcceptRequest(request.ownerId)}>Прийняти</Button>
                    </li>
                ))}
            </ul>

            <h3>Знайти друзів</h3>
            <div className="input-group mb-3">
                <input type="text" className="form-control" value={searchTerm} onChange={handleSearchChange} placeholder="Пошук за логіном" />
                <div className="input-group-append">
                    <Button className="btn btn-primary" onClick={handleSearch}>Знайти</Button>
                </div>
            </div>

            <ul className="list-group">
                {searchResults.map(result => (
                    <li key={result.objectId} className="list-group-item d-flex justify-content-between align-items-center">
                        {result.login}
                        {!sentRequests.includes(result.objectId) && (
                            <Button className="btn btn-primary btn-sm" onClick={() => handleAddFriend(result.objectId)}>Додати</Button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const FriendsMap = ({ friends }) => {
    return (
        <LeafletMapManyPlaces places={friends.map(friend => ({
            coordinates: friend.my_location,
            description: friend.login,
        }))} />
    );
};

export default Friends;

import React, { useState, useEffect } from 'react';
import Backendless from 'backendless';
import LeafletMapManyPlaces from "../Map/LeafletMapManyPlaces";

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFriends();
        fetchFriendRequests();
    }, []);

    const fetchFriends = async () => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`userId = '${currentUser.objectId}'`);
        const userFriends = await Backendless.Data.of('Friends').find(queryBuilder);

        const friendIds = userFriends.map(friend => friend.friendId);
        if (friendIds.length > 0) {
            const queryBuilder2 = Backendless.DataQueryBuilder.create().setWhereClause(`objectId IN ('${friendIds.join("','")}')`);
            const friendsList = await Backendless.Data.of('Users').find(queryBuilder2);
            setFriends(friendsList);
        }
    };

    const fetchFriendRequests = async () => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`receiverId = '${currentUser.objectId}'`);
        const requests = await Backendless.Data.of('FriendRequests').find(queryBuilder);

        // Fetch sender details for each request
        const requestsWithLogin = await Promise.all(requests.map(async request => {
            const sender = await Backendless.Data.of('Users').findById(request.senderId);
            return { ...request, senderLogin: sender.login }; // Include sender login
        }));

        setFriendRequests(requestsWithLogin);
    };


    const sendFriendRequest = async (receiverId) => {
        const currentUser = await Backendless.UserService.getCurrentUser();
        const friendRequest = {
            senderId: currentUser.objectId,
            receiverId: receiverId
        };
        await Backendless.Data.of('FriendRequests').save(friendRequest);
    };


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = async () => {
        const whereClause = `login LIKE '%${searchTerm}%' AND location_access = true`;
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
        const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(`senderId = '${senderId}' AND receiverId = '${currentUser.objectId}'`);
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
    };


    const handleAcceptRequest = async (senderId) => {
        await acceptFriendRequest(senderId);
        fetchFriends();
        fetchFriendRequests();
    };

    const handleRemoveFriend = async (friendId) => {
        await removeFriend(friendId);
        fetchFriends();
    };

    return (
        <div>
            <h2>Мої друзі</h2>
            <ul>
                {friends.map(friend => (
                    <li key={friend.objectId}>
                        {friend.login}
                        <button onClick={() => handleRemoveFriend(friend.objectId)}>Видалити</button>
                    </li>
                ))}
            </ul>
            <FriendsMap friends={friends.filter(friend => friend.location_access)} />

            <h2>Запити в друзі</h2>
            <ul>
                {friendRequests.map(request => (
                    <li key={request.objectId}>
                        {request.senderLogin}
                        <button onClick={() => handleAcceptRequest(request.senderId)}>Прийняти</button>
                    </li>
                ))}
            </ul>

            <h2>Знайти друзів</h2>
            <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Пошук за логіном" />
            <button onClick={handleSearch}>Знайти</button>

            <ul>
                {searchResults.map(result => (
                    <li key={result.objectId}>
                        {result.login}
                        <button onClick={() => handleAddFriend(result.objectId)}>Додати</button>
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

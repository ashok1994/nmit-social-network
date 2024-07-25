import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Friends = () => {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/friends', {
          headers: {
            'x-auth-token': token,
          },
        });
        setFriends(response.data);
      } catch (error) {
        console.error('Error fetching friends:', error);
        toast.error('Failed to fetch friends');
      }
    };

    fetchFriends();
  }, [user]);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/users/search?query=${searchQuery}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching friends:', error);
      toast.error('Failed to search friends');
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/addFriend', { friendId }, {
        headers: {
          'x-auth-token': token,
        },
      });
      toast.success('Friend added successfully');
      // Refresh friends list
      const response = await axios.get('http://localhost:5000/api/users/friends', {
        headers: {
          'x-auth-token': token,
        },
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Failed to add friend');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/removeFriend', { friendId }, {
        headers: {
          'x-auth-token': token,
        },
      });
      toast.success('Friend removed successfully');
      // Refresh friends list
      const response = await axios.get('http://localhost:5000/api/users/friends', {
        headers: {
          'x-auth-token': token,
        },
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  const isFriend = (userId) => {
    return friends.some(friend => friend._id === userId);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ToastContainer />
      <h1 className="text-4xl font-bold mb-6">Friends</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Friends</h2>
        <ul>
          {friends.map(friend => (
            <li key={friend._id} className="mb-2 flex items-center justify-between">
              <div className="flex items-center">
                {friend.profilePicture && (
                  <img src={`http://localhost:5000/${friend.profilePicture}`} alt="Profile" className="w-10 h-10 rounded-full mr-4" />
                )}
                <span>{friend.username}</span>
              </div>
              <button onClick={() => handleRemoveFriend(friend._id)} className="bg-red-500 text-white p-2 rounded">Remove Friend</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Search Friends</h2>
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Search by name"
          />
          <button onClick={handleSearch} className="mt-2 bg-blue-500 text-white p-2 rounded">Search</button>
        </div>
        <ul>
          {searchResults.map(result => (
            <li key={result._id} className="mb-2 flex justify-between items-center">
              <div className="flex items-center">
                {result.profilePicture && (
                  <img src={`http://localhost:5000/${result.profilePicture}`} alt="Profile" className="w-10 h-10 rounded-full mr-4" />
                )}
                <span>{result.username}</span>
              </div>
              {!isFriend(result._id) && (
                <button onClick={() => handleAddFriend(result._id)} className="bg-green-500 text-white p-2 rounded">Add Friend</button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Friends;
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [age, setAge] = useState(user?.age || '');
  const [relationshipStatus, setRelationshipStatus] = useState(user?.relationshipStatus || '');
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    setAge(user?.age || '');
    setRelationshipStatus(user?.relationshipStatus || '');
  }, [user]);

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return;
    const formData = new FormData();
    formData.append('profilePicture', profilePicture);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/uploadProfilePicture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
      });
      setUser(response.data.user);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch('http://localhost:5000/api/users/update', {
        age,
        relationshipStatus,
      }, {
        headers: {
          'x-auth-token': token,
        },
      });
      setUser(response.data);
      toast.success('Profile details updated successfully');
    } catch (error) {
      console.error('Error updating details:', error);
      toast.error('Failed to update profile details');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ToastContainer />
      <h1 className="text-4xl font-bold mb-6">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Profile Picture</label>
          {user?.profilePicture && (
            <img src={`http://localhost:5000/${user.profilePicture}`} alt="Profile" className="mb-4 w-24 h-24 rounded-full" />
          )}
          <input type="file" onChange={handleProfilePictureChange} className="block mb-2" />
          <button onClick={handleProfilePictureUpload} className="bg-blue-500 text-white p-2 rounded">Upload Picture</button>
        </div>
        <form onSubmit={handleUpdateDetails}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Relationship Status</label>
            <select
              value={relationshipStatus}
              onChange={(e) => setRelationshipStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Single">Single</option>
              <option value="In a relationship">In a relationship</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Update Details</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
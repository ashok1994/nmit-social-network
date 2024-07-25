import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex justify-around">
        <li>
          <Link to="/" className="text-white">Home</Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/profile" className="text-white">Profile</Link>
            </li>
            <li>
              <Link to="/friends" className="text-white">Friends</Link>
            </li>
            <li>
              <Link to="/chat" className="text-white">Chat</Link>
            </li>
            <li>
              <button onClick={logout} className="text-white">Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="text-white">Login</Link>
            </li>
            <li>
              <Link to="/signup" className="text-white">Signup</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
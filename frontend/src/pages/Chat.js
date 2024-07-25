import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import ChatPanel from '../components/ChatPanel';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/conversations', {
          headers: {
            'x-auth-token': token,
          },
        });
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Chat</h1>
      <div className="flex">
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Your Conversations</h2>
          <ul>
            {conversations.map(conversation => (
              <li key={conversation._id} className="mb-2 flex items-center justify-between">
                <div className="flex items-center cursor-pointer" onClick={() => setSelectedConversation(conversation)}>
                  {conversation.participants.map(participant => (
                    participant._id !== user._id && (
                      <div key={participant._id} className="flex items-center">
                        {participant.profilePicture && (
                          <img src={`http://localhost:5000/${participant.profilePicture}`} alt="Profile" className="w-10 h-10 rounded-full mr-4" />
                        )}
                        <span>{participant.username}</span>
                      </div>
                    )
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 ml-4">
          {selectedConversation && <ChatPanel conversation={selectedConversation} />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
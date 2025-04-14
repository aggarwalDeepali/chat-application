import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { io } from 'socket.io-client';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [taggedUserId, setTaggedUserId] = useState('');

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    // When a message is received via socket, fetch all messages again
    socketRef.current.on('receiveMessage', () => {
      const token = localStorage.getItem('token');
      if (token) {
        getMessages(token);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
          getMessages(token);
          getUsers(token);
        })
        .catch(console.error);
    }
  }, []);

  const getMessages = (token) => {
    axios
      .get('http://localhost:5000/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setMessages(response.data.data))
      .catch(console.error);
  };

  const getUsers = (token) => {
    axios
      .get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUsers(response.data))
      .catch(console.error);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    if (!taggedUserId) {
      alert('Please select a user to tag.');
      return;
    }

    const newMessage = {
      content: input,
      taggedUserIds: [Number(taggedUserId)],
    };

    axios
      .post('http://localhost:5000/api/messages', newMessage, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        const savedMsg = response.data.data;

        // Notify other clients to refetch
        socketRef.current.emit('sendMessage', savedMsg);

        setInput('');
        setTaggedUserId('');
      })
      .catch(console.error);
  };

  if (!user) return <div className="text-center mt-5">Loading chat...</div>;

  return (
    <div className="chat-container">
      <h4 className="mb-4 text-center">
        {user?.role === 'admin' ? 'Admin Chat' : 'Chat with Admin'}
      </h4>

      <div className="message-container">
        {messages.map((msg, i) => {
          const isSender = msg?.sender?.id === user.id;
          return (
            <div
              key={i}
              className={`d-flex mb-3 ${isSender ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div className={`message-bubble ${isSender ? 'sender' : 'other'}`}>
                <div>{msg?.content}</div>
                <div className="message-time">
                  {moment(msg?.createdAt).format('h:mm A, MMM D')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-3">
        <label htmlFor="tagUserSelect" className="form-label">
          Tag a User
        </label>
        <select
          id="tagUserSelect"
          className="form-select"
          value={taggedUserId}
          onChange={(e) => setTaggedUserId(e.target.value)}
        >
          <option value="">Select User</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;

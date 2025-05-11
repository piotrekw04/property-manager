import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import '../css/Chat.css';

export default function Chat() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);
  const [notifSocket, setNotifSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const myId = (() => {
    try {
      return jwtDecode(localStorage.getItem('access_token')).user_id;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    api.get('/messages/contacts/')
      .then(res => setContacts(res.data))
      .catch(err => {
        if (err.response?.status === 401) navigate('/login');
      });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);
    ws.onmessage = e => {
      const data = JSON.parse(e.data);
      if (data.type !== 'new_message') return;
      const senderId = Number(data.sender_id);
      setContacts(prev => {
        const idx = prev.findIndex(c => Number(c.id) === senderId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            last_message: data.last_message,
            hasUnread: true
          };
          return updated;
        }
        return [
          ...prev,
          {
            id: senderId,
            username: data.sender_username,
            last_message: data.last_message,
            hasUnread: true
          }
        ];
      });
    };
    setNotifSocket(ws);
    return () => ws.close();
  }, []);

  const openChat = async contact => {
    chatSocket?.close();
    setSelectedContact(contact);
    try {
      const res = await api.get(`/messages/${contact.id}/`);
      setMessages(res.data.messages.map(m => ({
        sender_name: m.sender_name,
        content: m.content,
        timestamp: m.timestamp
      })));
    } catch {
      setMessages([]);
    }
    const token = localStorage.getItem('access_token');
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${contact.id}/?token=${token}`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      const senderName = Number(d.sender_id) === myId ? 'Ja' : contact.username;
      setMessages(prev => [
        ...prev,
        { sender_name: senderName, content: d.message, timestamp: d.timestamp }
      ]);
    };
    setChatSocket(ws);
    setContacts(prev =>
      prev.map(c =>
        Number(c.id) === contact.id ? { ...c, hasUnread: false } : c
      )
    );
  };

  const handleSend = e => {
    e.preventDefault();
    if (!newMessage.trim() || !chatSocket) return;
    chatSocket.send(JSON.stringify({ message: newMessage }));
    setContacts(prev => {
      const idx = prev.findIndex(c => Number(c.id) === selectedContact.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          last_message: newMessage,
          hasUnread: false
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: selectedContact.id,
          username: selectedContact.username,
          last_message: newMessage,
          hasUnread: false
        }
      ];
    });
    setNewMessage('');
  };

  const handleSearch = async () => {
    try {
      const res = await api.get(`/user/search/?username=${searchUsername}`);
      setSearchResult(res.data);
    } catch {
      alert('Błąd wyszukiwania.');
      setSearchResult(null);
    }
  };

  const startConversation = () => {
    if (searchResult) {
      openChat(searchResult);
      setSearchUsername('');
      setSearchResult(null);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3>Kontakty</h3>
        <div className="chat-search-area">
          <input
            type="text"
            value={searchUsername}
            onChange={e => setSearchUsername(e.target.value)}
            placeholder="Wyszukaj użytkownika..."
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            Szukaj
          </button>
          {searchResult && (
            <div onClick={startConversation} className="search-result">
              Rozpocznij rozmowę z: <strong>{searchResult.username}</strong>
            </div>
          )}
        </div>
        {contacts.map(contact => (
          <div
            key={contact.id}
            onClick={() => openChat(contact)}
            className={`contact-item ${
              selectedContact?.id === contact.id ? 'selected' : ''
            }`}
          >
            {contact.username}
            {contact.hasUnread && <span className="unread-dot">•</span>}
            {contact.last_message && (
              <div className="contact-last-message">
                {contact.last_message.length > 30
                  ? contact.last_message.substring(0, 30) + '...'
                  : contact.last_message}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="chat-content">
        {selectedContact ? (
          <>
            <div className="chat-header">
              <h3>Czat z {selectedContact.username}</h3>
            </div>
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className="chat-message">
                  <strong>{msg.sender_name}:</strong> {msg.content}
                  <div className="chat-timestamp">
                    {new Date(msg.timestamp).toLocaleString('pl-PL')}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="chat-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Wpisz wiadomość..."
                className="chat-input"
              />
              <button type="submit">Wyślij</button>
            </form>
          </>
        ) : (
          <div className="chat-messages">
            <p>Wybierz lub wyszukaj kontakt, aby rozpocząć rozmowę 📬</p>
          </div>
        )}
      </div>
    </div>
  );
}

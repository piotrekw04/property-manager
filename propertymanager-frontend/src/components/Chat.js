import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function Chat() {
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

  // Zdekoduj swoje ID raz
  const myId = (() => {
    try {
      return jwtDecode(localStorage.getItem('access_token')).user_id;
    } catch {
      return null;
    }
  })();

  // Scroll do dołu przy każdej zmianie messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Początkowe załaduj kontakty
  useEffect(() => {
    api.get('/messages/contacts/')
      .then(res => setContacts(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) navigate('/login');
      });
  }, [navigate]);

  // WebSocket powiadomień
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);
    ws.onmessage = e => {
      const data = JSON.parse(e.data);
      if (data.type !== 'new_message') return;

      // Upewnij się, że senderId to number
      const senderId = Number(data.sender_id);

      setContacts(prev => {
        // Czy już mamy tego nadawcę?
        const idx = prev.findIndex(c => Number(c.id) === senderId);
        if (idx >= 0) {
          // Tylko uaktualnij
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            last_message: data.last_message,
            hasUnread: true
          };
          return updated;
        } else {
          // Dodaj nowy
          return [
            ...prev,
            {
              id: senderId,
              username: data.sender_username,
              last_message: data.last_message,
              hasUnread: true
            }
          ];
        }
      });
    };
    ws.onopen = () => console.log('Notif WS connected');
    ws.onclose = () => console.log('Notif WS disconnected');
    setNotifSocket(ws);

    return () => ws.close();
  }, []);

  // Funkcja otwierająca czat
  const openChat = async contact => {
    chatSocket?.close();
    setSelectedContact(contact);

    // Załaduj historię
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

    // WebSocket czatu
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
    ws.onopen = () => console.log('Chat WS connected');
    ws.onclose = () => console.log('Chat WS disconnected');
    setChatSocket(ws);

    // Oznacz jako przeczytane
    setContacts(prev =>
      prev.map(c =>
        Number(c.id) === contact.id ? { ...c, hasUnread: false } : c
      )
    );
  };

  // Wyślij wiadomość
  const handleSend = e => {
    e.preventDefault();
    if (!newMessage.trim() || !chatSocket) return;

    // Wyślij przez WS
    chatSocket.send(JSON.stringify({ message: newMessage }));

    // Zaktualizuj własną listę kontaktów dokładnie tak samo
    setContacts(prev => {
      const idx = prev.findIndex(c => Number(c.id) === selectedContact.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], last_message: newMessage, hasUnread: false };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: selectedContact.id,
            username: selectedContact.username,
            last_message: newMessage,
            hasUnread: false
          }
        ];
      }
    });

    setNewMessage('');
  };

  // Wyszukiwanie nowego
  const handleSearch = async () => {
    try {
      const res = await api.get(`/user/search/?username=${searchUsername}`);
      setSearchResult(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Błąd wyszukiwania.');
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

  // Render
  return (
    <div style={{ display: 'flex', height: '90vh' }}>
      {/* Lewy panel: kontakty */}
      <div style={{ width: '25%', borderRight: '1px solid #ccc', overflowY: 'auto', padding: 10 }}>
        <h3>Kontakty</h3>
        <div style={{ marginBottom: 15 }}>
          <input
            type="text"
            value={searchUsername}
            onChange={e => setSearchUsername(e.target.value)}
            placeholder="Wyszukaj użytkownika..."
            style={{ width: '100%', padding: 8, marginBottom: 5 }}
          />
          <button onClick={handleSearch} style={{ width: '100%', padding: 8 }}>Szukaj</button>
          {searchResult && (
            <div
              style={{ marginTop: 10, padding: 10, backgroundColor: '#e0f7fa', cursor: 'pointer' }}
              onClick={startConversation}
            >
              Rozpocznij rozmowę z: <strong>{searchResult.username}</strong>
            </div>
          )}
        </div>

        {contacts.map(contact => (
          <div
            key={contact.id}
            onClick={() => openChat(contact)}
            style={{
              padding: 10,
              cursor: 'pointer',
              backgroundColor: selectedContact?.id === contact.id ? '#e0e0e0' : 'transparent'
            }}
          >
            {contact.username}
            {contact.hasUnread && <span style={{ color: 'red', fontSize: 20 }}>•</span>}
            {contact.last_message && (
              <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>
                {contact.last_message.length > 30
                  ? contact.last_message.substring(0, 30) + '...'
                  : contact.last_message}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prawy panel: okno czatu */}
      <div style={{ width: '75%', display: 'flex', flexDirection: 'column' }}>
        {selectedContact ? (
          <>
            <div style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
              <h3>Czat z {selectedContact.username}</h3>
            </div>
            <div style={{ flexGrow: 1, padding: 10, overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong>{msg.sender_name}:</strong> {msg.content}
                  <div style={{ fontSize: 10, color: '#999' }}>
                    {new Date(msg.timestamp).toLocaleString('pl-PL')}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', padding: 10, borderTop: '1px solid #ccc' }}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Wpisz wiadomość..."
                style={{ flexGrow: 1, padding: 10, marginRight: 10 }}
              />
              <button type="submit">Wyślij</button>
            </form>
          </>
        ) : (
          <div style={{ padding: 20 }}>
            <p>Wybierz lub wyszukaj kontakt, aby rozpocząć rozmowę 📬</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;

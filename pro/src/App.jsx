import { useEffect, useRef, useState } from 'react';
import './styles.css';

const App = () => {
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([
    { user: 'ASTRA', text: 'Bienvenido a tu asistente personal. Inicia sesión para comenzar.', time: '00:00' },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [room, setRoom] = useState('general');
  const [history, setHistory] = useState([]);
  const [aiTask, setAiTask] = useState('');
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    if (!logged) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${room}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      addMessage('ASTRA', 'Conectado al servidor.');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.content) {
          addMessage(data.username || 'ASTRA', data.content);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    };

    ws.onerror = () => setConnected(false);
    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, [logged, room]);

  const addMessage = (user, text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { user, text, time }]);
  };

  const sendMessage = () => {
    if (!inputMsg.trim() || !wsRef.current) return;

    addMessage(username, inputMsg.trim());
    wsRef.current.send(JSON.stringify({ username, content: inputMsg.trim() }));
    setInputMsg('');
    setHistory((prev) => [...prev, { role: 'user', message: inputMsg.trim() }]);
  };

  const sendAiTask = () => {
    if (!aiTask.trim()) return;
    addMessage(username, aiTask.trim());
    setHistory((prev) => [...prev, { role: 'user', message: aiTask.trim() }]);
    addMessage('ASTRA', `He procesado tu tarea: "${aiTask.trim()}". Esto se conectará con la IA real del backend.`);
    setAiTask('');
  };

  const handleLogin = () => {
    if (!username.trim()) return;
    setLogged(true);
    setMessages([{ user: 'ASTRA', text: `Hola, ${username}. Tu sesión está activa.`, time: '00:00' }]);
  };

  const handleLogout = () => {
    setLogged(false);
    setUsername('');
    setMessages([]);
    setHistory([]);
    if (wsRef.current) wsRef.current.close();
    setConnected(false);
  };

  if (!logged) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">ASTRA</div>
          <div className="login-subtitle">Desktop Pro</div>
          <input
            type="text"
            placeholder="Tu nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="login-input"
          />
          <button className="login-btn" onClick={handleLogin}>
            Entrar al Escritorio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">A</div>
          <div className="brand-text">
            <div className="brand-name">ASTRA</div>
            <div className="brand-tag">Pro</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`nav-btn ${activeTab === 'browser' ? 'active' : ''}`}
            onClick={() => setActiveTab('browser')}
          >
            🌐 Navegador
          </button>
          <button
            className={`nav-btn ${activeTab === 'ia' ? 'active' : ''}`}
            onClick={() => setActiveTab('ia')}
          >
            🤖 IA
          </button>
          <button
            className={`nav-btn ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            📋 Historial
          </button>
        </nav>

        <div className="sidebar-section">
          <label className="section-label">Usuario</label>
          <input type="text" value={username} disabled className="sidebar-input" />
        </div>

        <div className="sidebar-section">
          <label className="section-label">Sala</label>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="sidebar-input"
          >
            <option value="general">General</option>
            <option value="dev">Dev</option>
            <option value="family">Family</option>
          </select>
        </div>

        <div className="status-badge">
          <span className={`status-dot ${connected ? 'online' : 'offline'}`}></span>
          <span>{connected ? 'Conectado' : 'Desconectado'}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="main-content">
        <header className="app-header">
          <div className="header-info">
            <h1>ASTRA Desktop Pro</h1>
            <p>Asistente personal en tiempo real</p>
          </div>
          <div className="header-status">{connected ? '🟢 Online' : '🔴 Offline'}</div>
        </header>

        <div className="content-area">
          {activeTab === 'chat' && (
            <div className="chat-view">
              <div className="messages-container">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.user === username ? 'user' : 'ai'}`}>
                    <div className="message-author">{msg.user}</div>
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">{msg.time}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-area">
                <input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="chat-input"
                />
                <button className="send-btn" onClick={sendMessage}>
                  Enviar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'browser' && (
            <div className="browser-view">
              <div className="browser-toolbar">
                <input
                  type="text"
                  placeholder="Ingresa una URL..."
                  value={browserUrl}
                  onChange={(e) => setBrowserUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setBrowserUrl(e.target.value)}
                  className="url-input"
                />
                <button className="go-btn" onClick={() => setBrowserUrl(browserUrl)}>
                  Ir
                </button>
              </div>
              <iframe
                src={browserUrl}
                title="Browser"
                className="browser-frame"
                sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
              />
            </div>
          )}

          {activeTab === 'ia' && (
            <div className="ia-view">
              <div className="ia-card">
                <h2>Tareas de IA</h2>
                <textarea
                  placeholder="Describe la tarea que deseas que realice la IA..."
                  value={aiTask}
                  onChange={(e) => setAiTask(e.target.value)}
                  className="ia-textarea"
                />
                <button className="ia-btn" onClick={sendAiTask}>
                  Enviar Tarea
                </button>
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="history-view">
              <h2>Historial de Conversaciones</h2>
              {history.length === 0 ? (
                <p className="empty-state">No hay historial aún.</p>
              ) : (
                <div className="history-list">
                  {history.map((item, idx) => (
                    <div key={idx} className="history-item">
                      <strong>{item.role === 'user' ? 'Tú' : 'IA'}:</strong> {item.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

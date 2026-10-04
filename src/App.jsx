import { useEffect, useMemo, useState } from 'react';

const defaultMessages = [
  { user: 'ASTRA', text: 'Hola. Conectado al backend.', time: 'ahora' },
  { user: 'ASTRA', text: 'Puedes abrir una URL o chatear.', time: 'ahora' },
];

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#e2e8f0',
  outline: 'none',
};

const buttonStyle = {
  background: '#8b5cf6',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '10px 14px',
  cursor: 'pointer',
  fontWeight: 700,
};

export default function App() {
  const [username, setUsername] = useState('Usuario');
  const [room, setRoom] = useState('general');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000/ws/general');

  useEffect(() => {
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = () => {
      setConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'message') {
          setMessages((prev) => [...prev, {
            user: data.username || 'ASTRA',
            text: data.content || '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      } catch (err) {
        console.error('WS message parse error', err);
      }
    };

    return () => socket.close();
  }, [wsUrl]);

  const statusText = useMemo(
    () => (connected ? 'Conectado al backend' : 'Sin conexión'),
    [connected]
  );

  const sendMessage = () => {
    if (!input.trim()) return;

    const socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      socket.send(JSON.stringify({
        username,
        content: input.trim(),
      }));
      setInput('');
      socket.close();
    };
  };

  const openBrowser = () => {
    const normalized = browserUrl.trim();
    if (!normalized) return;
    const finalUrl = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
    setBrowserUrl(finalUrl);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-logo">A</div>
          <div>
            <div className="brand-title">ASTRA</div>
            <div className="brand-subtitle">Desktop</div>
          </div>
        </div>

        <div className="panel-block">
          <label className="field-label">Tu nombre</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
        </div>

        <div className="panel-block">
          <label className="field-label">Sala</label>
          <select
            value={room}
            onChange={(e) => {
              const roomValue = e.target.value;
              setRoom(roomValue);
              setWsUrl(`ws://localhost:8000/ws/${roomValue}`);
            }}
            style={inputStyle}
          >
            <option value="general">General</option>
            <option value="dev">Dev</option>
            <option value="family">Family</option>
          </select>
        </div>

        <div className="panel-block status-box">
          <span className="status-dot" data-live={connected}></span>
          <span>{statusText}</span>
        </div>

        <button className="soft-btn" onClick={openBrowser}>Abrir navegador</button>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <div className="topbar-title">ASTRA Desktop</div>
            <div className="topbar-subtitle">AI assistant shell</div>
          </div>
          <div className="topbar-status">{statusText}</div>
        </header>

        <section className="workspace">
          <div className="chat-panel">
            <div className="chat-header">Mensajes</div>
            <div className="messages-box">
              {messages.map((msg, index) => (
                <div key={`${msg.user}-${index}`} className="message-card">
                  <div className="message-head">
                    <strong>{msg.user}</strong>
                    <span>{msg.time}</span>
                  </div>
                  <div className="message-body">{msg.text}</div>
                </div>
              ))}
            </div>

            <div className="composer">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Escribe tu mensaje..."
                style={inputStyle}
              />
              <button style={buttonStyle} onClick={sendMessage}>Enviar</button>
            </div>
          </div>

          <div className="browser-panel">
            <div className="browser-header">
              <input
                value={browserUrl}
                onChange={(e) => setBrowserUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openBrowser();
                }}
                style={inputStyle}
              />
              <button className="soft-btn small" onClick={openBrowser}>Ir</button>
            </div>

            <div className="browser-frame-wrap">
              <iframe
                title="ASTRA Browser"
                src={browserUrl}
                className="browser-frame"
                sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

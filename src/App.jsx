import { useEffect, useMemo, useState } from 'react';

const defaultMessages = [
  { user: 'ASTRA', text: 'Hola, soy tu asistente personal. Todo listo para operar.', time: 'ahora' },
  { user: 'ASTRA', text: 'Puedes hablar en cualquier sala, abrir una URL o consultar tu dashboard.', time: 'ahora' },
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
  background: 'linear-gradient(135deg, #8b5cf6, #4f46e5)',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '11px 16px',
  cursor: 'pointer',
  fontWeight: 700,
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('Usuario');
  const [room, setRoom] = useState('general');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000/ws/general');
  const [aiPrompt, setAiPrompt] = useState('Resumen del día');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'message') {
          setMessages((prev) => [
            ...prev,
            {
              user: data.username || 'ASTRA',
              text: data.content || '',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    return () => socket.close();
  }, [wsUrl]);

  const statusText = useMemo(
    () => (connected ? 'Conectado al backend' : 'Sin conexión'),
    [connected]
  );

  const doLogin = () => {
    if (!username.trim()) return;
    setLoggedIn(true);
    setShowWelcome(false);
  };

  const sendMessage = () => {
    if (!input.trim() || !loggedIn) return;

    const socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      socket.send(JSON.stringify({ username, content: input.trim() }));
      setInput('');
      socket.close();
    };
  };

  const sendAiTask = () => {
    if (!aiPrompt.trim()) return;
    setMessages((prev) => [
      ...prev,
      { user: username || 'Tú', text: aiPrompt.trim(), time: 'ahora' },
      {
        user: 'ASTRA',
        text: `He recibido tu pedido: “${aiPrompt.trim()}”. Esto puede ejecutarse desde el backend si conectas la IA real.`,
        time: 'ahora',
      },
    ]);
    setAiPrompt('');
  };

  const openBrowser = () => {
    const normalized = browserUrl.trim();
    if (!normalized) return;
    const finalUrl = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
    setBrowserUrl(finalUrl);
  };

  if (!loggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-brand">ASTRA</div>
          <div className="login-subtitle">Personal AI Desktop</div>

          <label className="field-label">Nombre de usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            placeholder="Escribe tu nombre"
          />

          <button className="primary-btn" onClick={doLogin}>Entrar al escritorio</button>
        </div>
      </div>
    );
  }

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
          <label className="field-label">Usuario</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
        </div>

        <div className="panel-block">
          <label className="field-label">Sala</label>
          <select
            value={room}
            onChange={(e) => {
              const nextRoom = e.target.value;
              setRoom(nextRoom);
              setWsUrl(`ws://localhost:8000/ws/${nextRoom}`);
            }}
            style={inputStyle}
          >
            <option value="general">General</option>
            <option value="dev">Dev</option>
            <option value="family">Family</option>
            <option value="assistant">Assistant</option>
          </select>
        </div>

        <div className="panel-block status-box">
          <span className="status-dot" data-live={connected}></span>
          <span>{statusText}</span>
        </div>

        <button className="soft-btn" onClick={openBrowser}>Abrir navegador</button>

        <div className="mini-panel">
          <div className="mini-title">IA rápida</div>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={4}
            placeholder="Escribe una tarea para la IA..."
            className="mini-textarea"
          />
          <button className="primary-btn small" onClick={sendAiTask}>Enviar</button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <div className="topbar-title">ASTRA Desktop</div>
            <div className="topbar-subtitle">Asistente personal</div>
          </div>
          <div className="topbar-status">{statusText}</div>
        </header>

        {showWelcome && (
          <div className="welcome-banner">
            Bienvenido, <strong>{username}</strong>. Tu escritorio está listo para operar.
          </div>
        )}

        <section className="workspace">
          <div className="chat-panel">
            <div className="chat-header">Chat en tiempo real</div>
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

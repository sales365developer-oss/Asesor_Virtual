import { useEffect, useRef, useState } from "react";
import {
  Activity, AudioLines, Bot, Check, CircleHelp, Clock3, Heart,
  Keyboard, Mic, MicOff, Send, Settings2, Sparkles, Trash2, Volume2,
  VolumeX, Waves, X
} from "lucide-react";

const initialMessages = [
  {
    id: 1,
    role: "assistant",
    text: "¡Hola! 👋 Soy Jhoel, tu asistente virtual. Estoy lista para conversar contigo. ¿Qué te gustaría hacer hoy?"
  }
];

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState("Demo visual · IA aún no conectada");
  const [showSettings, setShowSettings] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(text) {
    if (muted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-PE";
    utterance.rate = 1;
    utterance.pitch = 1.06;
    const voices = window.speechSynthesis.getVoices();
    const selected = voices.find(v => v.name === voiceName)
      || voices.find(v => v.lang?.toLowerCase().startsWith("es") && /female|woman|sabina|helena|paulina|monica|lucia/i.test(v.name))
      || voices.find(v => v.lang?.toLowerCase().startsWith("es"));
    if (selected) utterance.voice = selected;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function demoReply(userText) {
    const reply = `¡Gracias por contarme! 😊 He recibido tu mensaje: “${userText}”. En esta primera versión estoy en modo demostración. En el siguiente paso conectaremos mi cerebro de inteligencia artificial para que pueda responderte libremente.`;
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant", text: reply
      }]);
      speak(reply);
    }, 450);
  }

  function sendMessage(value = input) {
    const text = value.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text }]);
    setInput("");
    demoReply(text);
  }

  function toggleListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    if (!SpeechRecognition) {
      setNotice("Tu navegador no permite reconocimiento de voz. Prueba Chrome o Edge.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-PE";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onstart = () => {
        setListening(true);
        setNotice("Te estoy escuchando…");
      };
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        setListening(false);
        setNotice("Mensaje recibido");
        if (transcript) sendMessage(transcript);
      };
      recognition.onerror = (event) => {
        setListening(false);
        setNotice(event.error === "not-allowed"
          ? "Permite el acceso al micrófono en tu navegador."
          : "No pude escuchar bien. Inténtalo nuevamente.");
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
      setNotice("No se pudo iniciar el micrófono. Revisa los permisos.");
    }
  }

  function clearChat() {
    setMessages(initialMessages);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setNotice("Conversación reiniciada");
  }

  const availableVoices = typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis.getVoices().filter(v => v.lang?.toLowerCase().startsWith("es"))
    : [];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Jhoel inicio">
          <span className="brand-mark"><AudioLines size={29} /></span>
          <span><strong>Jhoel</strong><small>Tu asistente virtual</small></span>
        </a>
        <div className="top-actions">
          <span className="online-pill"><i /> En línea</span>
          <button className="icon-button" onClick={() => setShowSettings(v => !v)} aria-label="Configuración">
            <Settings2 size={19} />
          </button>
        </div>
      </header>

      {showSettings && (
        <section className="settings-popover">
          <div className="settings-title"><strong>Configuración de voz</strong><button onClick={() => setShowSettings(false)}><X size={16}/></button></div>
          <label htmlFor="voice-select">Voz en español disponible en tu dispositivo</label>
          <select id="voice-select" value={voiceName} onChange={e => setVoiceName(e.target.value)}>
            <option value="">Automática (español)</option>
            {availableVoices.map(v => <option key={v.name} value={v.name}>{v.name} · {v.lang}</option>)}
          </select>
          <p>Las voces dependen del navegador y del sistema operativo.</p>
        </section>
      )}

      <section className="workspace">
        <section className="assistant-panel">
          <div className="avatar-stage">
            <div className={`avatar-glow ${listening ? "is-listening" : ""} ${speaking ? "is-speaking" : ""}`} />
            <div className="avatar-frame">
              <img src="/jhoel-avatar.jpg" alt="Avatar de Jhoel, asistente virtual" />
            </div>
            <div className="hello-card">
              <span className="hello-eyebrow"><Sparkles size={14}/> TU ASISTENTE PERSONAL</span>
              <h1>¡Hola! <span>👋</span></h1>
              <p>Soy Jhoel. Estoy aquí para conversar, ayudarte y acompañarte.</p>
            </div>
          </div>

          <div className="voice-area">
            <div className={`sound-bars ${listening || speaking ? "active" : ""}`} aria-hidden="true">
              {Array.from({ length: 17 }, (_, i) => <i key={i} style={{ "--i": i }} />)}
            </div>
            <button className={`talk-button ${listening ? "listening" : ""}`} onClick={toggleListening}>
              {listening ? <MicOff size={25}/> : <Mic size={25}/>}
            </button>
            <div className="talk-label">{listening ? "Te estoy escuchando…" : "Presiona para hablar"}</div>
            <div className="voice-notice">{notice}</div>
          </div>

          <div className="feature-row">
            <div><Sparkles size={17}/><span>Conversación<br/>inteligente</span></div>
            <div><Waves size={18}/><span>Voz natural</span></div>
            <div><Heart size={17}/><span>Siempre contigo</span></div>
          </div>
        </section>

        <section className="chat-panel">
          <div className="chat-header">
            <div className="chat-heading"><span className="chat-icon"><Bot size={20}/></span><div><strong>Conversación</strong><small>Habla o escribe con Jhoel</small></div></div>
            <div className="chat-tools">
              <button className="icon-button sound-toggle" onClick={() => setMuted(v => !v)} title={muted ? "Activar voz" : "Silenciar voz"}>
                {muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}
              </button>
              <button className="clear-button" onClick={clearChat}><Trash2 size={15}/> <span>Limpiar</span></button>
            </div>
          </div>

          <div className="messages" aria-live="polite">
            {messages.map(message => (
              <div className={`message-row ${message.role}`} key={message.id}>
                {message.role === "assistant" && <div className="mini-avatar"><img src="/jhoel-avatar.jpg" alt="Jhoel"/></div>}
                <div className="message-bubble">
                  <p>{message.text}</p>
                  {message.role === "assistant" && (
                    <button className="speak-message" onClick={() => speak(message.text)} aria-label="Escuchar respuesta"><Volume2 size={14}/> Escuchar</button>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          <form className="composer" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
            <Keyboard className="composer-keyboard" size={19}/>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe tu mensaje..." aria-label="Escribe tu mensaje"/>
            <button type="submit" className="send-button" disabled={!input.trim()} aria-label="Enviar mensaje"><Send size={19}/></button>
          </form>
          <div className="chat-footnote"><span><Check size={13}/> Demo local</span><span>Tu conversación no se guarda</span></div>
        </section>
      </section>

      <footer className="footer">
        <span><Heart size={14} fill="currentColor"/> Jhoel · Siempre contigo</span>
        <span>Una nueva forma de conversar</span>
      </footer>
    </main>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { Activity, AudioLines, Heart, Mic, MicOff, Settings2, Sparkles, Volume2, Waves, X } from "lucide-react";

export default function App() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [notice, setNotice] = useState("Presiona el micrófono y háblame");
  const [heardText, setHeardText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [availableVoices, setAvailableVoices] = useState([]);
  const recognitionRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => {
    const loadVoices = () => {
      if (!("speechSynthesis" in window)) return;
      setAvailableVoices(window.speechSynthesis.getVoices().filter(v => v.lang?.toLowerCase().startsWith("es")));
    };
    loadVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", loadVoices);
    return () => {
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel?.();
      window.speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, []);

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      setNotice("Tu navegador no tiene reproducción de voz disponible.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-PE";
    utterance.rate = 0.96;
    utterance.pitch = 1.08;
    const selected = availableVoices.find(v => v.name === voiceName)
      || availableVoices.find(v => /female|woman|sabina|helena|paulina|monica|lucia|sofia/i.test(v.name))
      || availableVoices.find(v => v.lang?.toLowerCase().startsWith("es"));
    if (selected) utterance.voice = selected;
    utterance.onstart = () => { setSpeaking(true); setNotice("Jhoel te está respondiendo…"); };
    utterance.onend = () => { setSpeaking(false); setNotice("Cuando quieras, puedes volver a hablar"); };
    utterance.onerror = () => { setSpeaking(false); setNotice("No pude reproducir la voz. Revisa el audio."); };
    window.speechSynthesis.speak(utterance);
  }

  async function askJhoel(transcript) {
    setThinking(true);
    setNotice("Estoy pensando en tu respuesta…");
    const messages = [...conversationRef.current, { role: "user", content: transcript }];
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(apiUrl + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo obtener una respuesta de la IA.");
      conversationRef.current = [...messages, { role: "assistant", content: data.reply }].slice(-20);
      speak(data.reply);
    } catch (error) {
      console.error("Error al consultar Jhoel:", error);
      setNotice(error.message || "No pude conectarme con el modelo de IA.");
    } finally {
      setThinking(false);
    }
  }

  function toggleListening() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setNotice("Respuesta detenida. Puedes volver a hablar.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setNotice("Escucha detenida");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotice("Tu navegador no admite reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }
    if (thinking) return;
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-PE";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onstart = () => { setListening(true); setHeardText(""); setNotice("Te estoy escuchando…"); };
      recognition.onresult = event => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        setListening(false);
        if (transcript) {
          setHeardText(transcript);
          askJhoel(transcript);
        } else setNotice("No logré escuchar. Inténtalo otra vez.");
      };
      recognition.onerror = event => {
        setListening(false);
        setNotice(event.error === "not-allowed" ? "Permite el acceso al micrófono en tu navegador." : "No pude escuchar bien. Inténtalo nuevamente.");
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
      setNotice("No se pudo iniciar el micrófono. Revisa los permisos.");
    }
  }

  function resetConversation() {
    conversationRef.current = [];
    setHeardText("");
    window.speechSynthesis?.cancel?.();
    setSpeaking(false);
    setNotice("Empezamos de nuevo. ¿De qué te gustaría hablar?");
    setShowSettings(false);
  }

  return (
    <main className="app-shell voice-only">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Jhoel inicio">
          <span className="brand-mark"><AudioLines size={29} /></span>
          <span><strong>Jhoel</strong><small>Tu asistente virtual</small></span>
        </a>
        <div className="top-actions">
          <span className="online-pill"><i /> IA disponible</span>
          <button className="icon-button" onClick={() => setShowSettings(v => !v)} aria-label="Configuración"><Settings2 size={19} /></button>
        </div>
      </header>

      {showSettings && (
        <section className="settings-popover">
          <div className="settings-title"><strong>Configuración de voz</strong><button onClick={() => setShowSettings(false)} aria-label="Cerrar"><X size={16}/></button></div>
          <label htmlFor="voice-select">Voz en español de tu dispositivo</label>
          <select id="voice-select" value={voiceName} onChange={e => setVoiceName(e.target.value)}>
            <option value="">Automática (español)</option>
            {availableVoices.map(v => <option key={v.name} value={v.name}>{v.name} · {v.lang}</option>)}
          </select>
          <p>Las voces disponibles dependen del navegador y del sistema operativo.</p>
          <button className="reset-voice-button" onClick={resetConversation}>Reiniciar conversación</button>
        </section>
      )}

      <section className="workspace voice-workspace">
        <section className="assistant-panel">
          <div className="avatar-stage">
            <div className={["avatar-glow", listening && "is-listening", speaking && "is-speaking", thinking && "is-thinking"].filter(Boolean).join(" ")} />
            <div className="avatar-frame"><img src="/jhoel-avatar.jpg" alt="Avatar de Jhoel, asistente virtual" /></div>
            <div className="hello-card">
              <span className="hello-eyebrow"><Sparkles size={14}/> TU ASISTENTE PERSONAL</span>
              <h1>¡Hola! <span>👋</span></h1>
              <p>Soy Jhoel. Hablemos, estoy aquí para ayudarte.</p>
            </div>
          </div>

          <div className="voice-area">
            <div className={["sound-bars", (listening || speaking || thinking) && "active"].filter(Boolean).join(" ")} aria-hidden="true">
              {Array.from({ length: 17 }, (_, i) => <i key={i} style={{ "--i": i }} />)}
            </div>
            <button className={["talk-button", listening && "listening", thinking && "thinking"].filter(Boolean).join(" ")} onClick={toggleListening} disabled={thinking} aria-label="Hablar con Jhoel">
              {listening ? <MicOff size={25}/> : speaking ? <Volume2 size={25}/> : <Mic size={25}/>}
            </button>
            <div className="talk-label">{listening ? "Te estoy escuchando…" : thinking ? "Estoy pensando…" : speaking ? "Estoy hablando…" : "Presiona para hablar"}</div>
            <div className="voice-notice" aria-live="polite">{notice}</div>
          </div>

          {heardText && <div className="heard-preview"><span>TE ESCUCHÉ DECIR</span><p>“{heardText}”</p></div>}

          <div className="feature-row">
            <div><Sparkles size={17}/><span>Inteligencia<br/>artificial</span></div>
            <div><Waves size={18}/><span>Conversación<br/>por voz</span></div>
            <div><Heart size={17}/><span>Siempre<br/>contigo</span></div>
          </div>
        </section>
      </section>

      <footer className="footer">
        <span><Heart size={14} fill="currentColor"/> Jhoel · Siempre contigo</span>
        <span><Activity size={14}/> Conversación privada en esta sesión</span>
      </footer>
    </main>
  );
}

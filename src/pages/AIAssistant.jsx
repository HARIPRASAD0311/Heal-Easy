import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';
import usePageEffects from '../hooks/usePageEffects';
import { useAuth } from '../context/AuthContext';
import { startIntake, getSummary, getDepartments } from '../api/services';
import hospitals from '../data/hospitals';
import '../styles/AIAssistant.css';

const suggestions = ['No neck stiffness', 'Fever is 100.4°F', 'Talk to a doctor now'];

const initialMessages = [
  { from: 'ai', text: "Hi, I'm HealEasy's assistant. Pick a hospital and department below, then tell me your main symptom — for example, \"chest tightness for 2 days.\"" },
];

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20; // ~60s

export default function AIAssistant() {
  usePageEffects();
  const { user } = useAuth();

  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState(hospitals[0]?.id || '');
  const [deptId, setDeptId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [deptsLoading, setDeptsLoading] = useState(true);

  useEffect(() => {
    if (!hospitalId) return;
    let cancelled = false;
    setDeptsLoading(true);

    getDepartments(hospitalId)
      .then((depts) => {
        if (cancelled) return;
        setDepartments(depts || []);
        setDeptId(depts?.[0]?.departmentId || '');
      })
      .catch(() => {
        if (!cancelled) {
          setDepartments([]);
          setDeptId('');
        }
      })
      .finally(() => {
        if (!cancelled) setDeptsLoading(false);
      });

    return () => { cancelled = true; };
  }, [hospitalId]);

  const pollTimer = useRef(null);
  useEffect(() => () => clearTimeout(pollTimer.current), []);

  // Real voice-to-text using the browser's built-in Speech Recognition
  // API — no Transcribe/S3/async job handling needed. Not supported in
  // every browser (Chrome/Edge yes, Firefox no as of writing), so the
  // mic button is hidden entirely where it isn't available.
  const recognitionRef = useRef(null);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setVoiceSupported(true);
    const recognition = new SpeechRecognition();
    // continuous=true: keeps listening until the user manually taps
    // stop, instead of auto-cutting off after the first brief pause
    // (which is what caused the "only holds 1 second" behavior).
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setMessage((prev) => (prev ? `${prev} ${finalTranscript}`.trim() : finalTranscript.trim()));
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  function toggleVoiceInput() {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  function pollForSummary(visitId, attemptsLeft) {
    if (attemptsLeft <= 0) {
      setChatLog((prev) => [
        ...prev,
        { from: 'ai', text: "This is taking longer than expected — check My Appointments shortly, your intake was still submitted." },
      ]);
      setIsLoading(false);
      return;
    }

    pollTimer.current = setTimeout(async () => {
      try {
        const summary = await getSummary(visitId);
        if (summary?.structuredSummary) {
          setChatLog((prev) => [
            ...prev,
            { from: 'ai', text: summary.structuredSummary },
          ]);
          setIsLoading(false);
        } else {
          pollForSummary(visitId, attemptsLeft - 1);
        }
      } catch (err) {
        // 404 is expected while the summary item doesn't exist yet — keep polling.
        pollForSummary(visitId, attemptsLeft - 1);
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    if (!user?.patientId) {
      setChatLog((prev) => [...prev, { from: 'ai', text: 'Please log in first so I can save this to your visit history.' }]);
      return;
    }

    setChatLog((prev) => [...prev, { from: 'user', text: trimmed }]);
    setMessage('');
    setIsLoading(true);

    try {
  
      const { visitId } = await startIntake({
        patientId: user.patientId,
        hospitalId,
        deptId,
        transcriptText: trimmed,
      });

      setChatLog((prev) => [
        ...prev,
        { from: 'ai', text: "Got it — analyzing that now..." },
      ]);

      pollForSummary(visitId, MAX_POLL_ATTEMPTS);
    } catch (error) {
      console.error('Error calling startIntake:', error);
      setChatLog((prev) => [
        ...prev,
        { from: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again shortly." },
      ]);
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <PageShell>
      <Navbar
        title="AI Assistant"
        rightActions={
          <button className="icon-btn" aria-label="Conversation history">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
              <path d="M12 8v4l3 2" />
            </svg>
          </button>
        }
      />

      <main id="main" className="container mt-md">
        <div className="ai-orb-wrap" data-reveal="scale">
          <div className="ai-orb-ring"></div>
          <div className="ai-orb animate-pulse"></div>
        </div>
        <p className="text-secondary mt-sm" style={{ textAlign: 'center' }}>
          Describe how you feel — I'll help you find the right care.
        </p>

        <div className="intake-context-row mt-sm" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} disabled={isLoading}>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <select value={deptId} onChange={(e) => setDeptId(e.target.value)} disabled={isLoading || deptsLoading}>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="chat-log mt-lg" role="log" aria-live="polite">
          {chatLog.map((entry, i) => (
            <div className={`chat-bubble from-${entry.from}`} key={i}>
              {entry.text}
            </div>
          ))}
          {isLoading && (
            <div className="chat-bubble from-ai loading-dots">
              Thinking...
            </div>
          )}
        </div>

        <div className="suggestions-row mt-sm">
          {suggestions.map((chip) => (
            <button
              className="suggestion-chip"
              key={chip}
              onClick={() => setMessage(chip)}
              disabled={isLoading}
            >
              {chip}
            </button>
          ))}
        </div>
      </main>

      <div className="chat-input-fixed">
        <div className="chat-input-bar">
          {voiceSupported && (
            <button
              className={`voice-btn${isListening ? ' is-listening' : ''}`}
              style={{ width: 40, height: 40, boxShadow: 'none', background: 'rgba(0,78,100,0.08)', color: 'var(--color-primary)' }}
              aria-label={isListening ? 'Stop voice input' : 'Use voice input'}
              onClick={toggleVoiceInput}
              disabled={isLoading}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </button>
          )}
          <input
            type="text"
            placeholder={isLoading ? "Processing intake..." : "Describe your symptoms…"}
            aria-label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="btn btn-primary btn-icon-only"
            aria-label="Send"
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
            </svg>
          </button>
        </div>
      </div>
    </PageShell>
  );
}
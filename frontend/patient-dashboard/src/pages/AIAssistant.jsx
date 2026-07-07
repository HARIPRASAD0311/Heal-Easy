import { useState } from 'react';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';
import usePageEffects from '../hooks/usePageEffects';
import '../styles/AIAssistant.css';

const suggestions = ['No neck stiffness', 'Fever is 100.4°F', 'Talk to a doctor now'];

export default function AIAssistant() {
  usePageEffects();
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('');

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
          <div className="ai-orb"></div>
        </div>
        <p className="text-secondary mt-sm" style={{ textAlign: 'center' }}>
          Describe how you feel — I'll help you find the right care.
        </p>

        <div className="chat-log mt-lg" role="log" aria-live="polite">
          <div className="chat-bubble from-ai">
            Hi, I'm HealEasy's assistant. Tell me your main symptom to get started — for example, "chest tightness for 2 days."
          </div>
          <div className="chat-bubble from-user">I've had a dull headache and slight fever since yesterday.</div>
          <div className="chat-bubble from-ai">
            Thanks for sharing. A few quick questions: is the fever above 101°F, and do you have any neck stiffness or sensitivity to light?
          </div>
          <div className="chat-bubble from-ai typing-preview">
            <span className="typing-dots"><span></span><span></span><span></span></span>
          </div>
        </div>

        <div className="suggestions-row mt-sm">
          {suggestions.map((chip) => (
            <button className="suggestion-chip" key={chip} onClick={() => setMessage(chip)}>
              {chip}
            </button>
          ))}
        </div>
      </main>

      <div className="chat-input-fixed">
        <div className="chat-input-bar">
          <button
            className={`voice-btn${isListening ? ' is-listening' : ''}`}
            style={{ width: 40, height: 40, boxShadow: 'none', background: 'rgba(0,78,100,0.08)', color: 'var(--color-primary)' }}
            aria-label="Use voice input"
            onClick={() => setIsListening((prev) => !prev)}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Describe your symptoms…"
            aria-label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="btn btn-primary btn-icon-only" aria-label="Send">
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

import React, { useState, useEffect } from 'react';
import SignToText from './components/SignToText';
import TextToSign from './components/TextToSign';
import { checkHealth } from './services/api';
import { Waves, Code, Globe } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('sign-to-text'); // 'sign-to-text' or 'text-to-sign'
  const [isSystemReady, setIsSystemReady] = useState(false);

  useEffect(() => {
    const initHealth = async () => {
      try {
        const data = await checkHealth();
        if (data.status === 'UP' && data.pythonServiceStatus === 'UP') {
          setIsSystemReady(true);
        }
      } catch (e) {
        setIsSystemReady(false);
      }
    };
    initHealth();
  }, []);

  return (
    <div className="app-layout">
      <nav className="top-nav glass-panel">
        <div className="nav-brand">
          <Waves className="brand-icon" size={28} />
          <h1>SignBridge</h1>
        </div>
        <div className="nav-status">
          <span className={`status-dot ${isSystemReady ? 'online' : 'offline'}`}></span>
          <span className="status-text">{isSystemReady ? 'System Online' : 'Connecting...'}</span>
        </div>
      </nav>

      <div className="app-container">
        <header className="page-header">
          <h2>Translate Seamlessly</h2>
          <p>Real-time AI-powered sign language recognition & rendering.</p>
        </header>

        <main className="main-content">
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'sign-to-text' ? 'active' : ''}`}
              onClick={() => setActiveTab('sign-to-text')}
            >
              Sign to Text
            </button>
            <button 
              className={`tab-btn ${activeTab === 'text-to-sign' ? 'active' : ''}`}
              onClick={() => setActiveTab('text-to-sign')}
            >
              Text to Sign
            </button>
          </div>

          {activeTab === 'sign-to-text' ? (
             <SignToText isSystemReady={isSystemReady} />
          ) : (
             <TextToSign />
          )}
        </main>
      </div>

      <footer className="app-footer glass-panel">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} SignBridge. Accelerating Accessibility.</p>
          <div className="footer-links">
             <a href="https://github.com"><Globe size={20} /></a>
             <a href="#"><Code size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

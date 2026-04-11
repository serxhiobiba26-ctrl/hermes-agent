import { useState, useRef, useEffect } from 'react'
import StepCard from './components/StepCard'
import './App.css'

const EXAMPLE_QUESTIONS = [
  "Che tempo fa a Roma e a Londra?",
  "Quanto fa (145 * 3) + (280 / 4)?",
  "Cerca informazioni sull'intelligenza artificiale",
  "Che tempo fa a Tokyo? E quanto fa 25 * 4?",
]

export default function App() {
  const [input, setInput] = useState('')
  const [steps, setSteps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const stepsEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [steps])

  const addStep = (step) => {
    setSteps((prev) => [...prev, { ...step, id: Date.now() + Math.random() }])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || isLoading) return

    setInput('')
    setSteps([])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim()
            if (raw === '[DONE]') continue
            try {
              const event = JSON.parse(raw)
              switch (event.type) {
                case 'user_message':
                  addStep({ type: 'user_message', content: event.content })
                  break
                case 'thinking':
                  addStep({ type: 'thinking', content: event.content })
                  break
                case 'tool_call':
                  addStep({
                    type: 'tool_call',
                    toolName: event.toolName,
                    toolInput: event.toolInput,
                  })
                  break
                case 'tool_result':
                  addStep({
                    type: 'tool_result',
                    toolName: event.toolName,
                    result: event.result,
                  })
                  break
                case 'assistant_text':
                  addStep({ type: 'assistant_text', content: event.content })
                  break
                case 'error':
                  addStep({ type: 'error', content: event.content })
                  break
              }
            } catch {
              // ignore malformed lines
            }
          }
        }
      }
    } catch (err) {
      addStep({ type: 'error', content: err.message || 'Connection error' })
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleExampleClick = (question) => {
    setInput(question)
    inputRef.current?.focus()
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-icon">&gt;_</span>
            <div>
              <h1>AI Dietro le Quinte</h1>
              <p className="header-subtitle">Ep.1 Tool Use</p>
            </div>
          </div>
          <div className="header-badge">
            <span className="badge-dot" />
            Powered by Claude
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Info panel */}
        {steps.length === 0 && !isLoading && (
          <div className="info-panel">
            <h2>Come funziona un agente AI?</h2>
            <p>
              Questa demo mostra il <strong>loop agente</strong> dietro le quinte.
              Quando fai una domanda, l'AI decide se usare uno strumento (tool),
              legge il risultato, e poi formula la risposta finale.
            </p>
            <div className="tools-grid">
              <div className="tool-card">
                <span className="tool-emoji">&#9925;</span>
                <div>
                  <strong>get_weather</strong>
                  <span>Meteo di una citta</span>
                </div>
              </div>
              <div className="tool-card">
                <span className="tool-emoji">&#128290;</span>
                <div>
                  <strong>calculate</strong>
                  <span>Calcoli matematici</span>
                </div>
              </div>
              <div className="tool-card">
                <span className="tool-emoji">&#128269;</span>
                <div>
                  <strong>search_web</strong>
                  <span>Ricerca sul web</span>
                </div>
              </div>
            </div>
            <div className="examples">
              <p className="examples-label">Prova con:</p>
              <div className="examples-list">
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <button key={i} className="example-btn" onClick={() => handleExampleClick(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Steps timeline */}
        {steps.length > 0 && (
          <div className="steps-container">
            <div className="steps-header">
              <span className="steps-label">Agent Loop</span>
              <span className="steps-count">{steps.length} steps</span>
            </div>
            <div className="steps-timeline">
              {steps.map((step) => (
                <StepCard key={step.id} step={step} />
              ))}
              {isLoading && (
                <div className="step-loading">
                  <div className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={stepsEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Input bar */}
      <footer className="input-bar">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-wrapper">
            <span className="input-prompt">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi una domanda..."
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
              {isLoading ? (
                <span className="spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </footer>
    </div>
  )
}

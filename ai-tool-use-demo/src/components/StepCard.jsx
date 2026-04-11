import { useState } from 'react'

const STEP_CONFIG = {
  user_message: {
    label: 'USER',
    icon: '→',
    className: 'step-user',
  },
  thinking: {
    label: 'LOOP',
    icon: '⟳',
    className: 'step-thinking',
  },
  tool_call: {
    label: 'TOOL CALL',
    icon: '⚡',
    className: 'step-tool-call',
  },
  tool_result: {
    label: 'TOOL RESULT',
    icon: '✓',
    className: 'step-tool-result',
  },
  assistant_text: {
    label: 'ASSISTANT',
    icon: '◆',
    className: 'step-assistant',
  },
  error: {
    label: 'ERROR',
    icon: '✗',
    className: 'step-error',
  },
}

function JsonBlock({ data, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2)

  return (
    <div className="json-block">
      <button className="json-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? '▼' : '▶'} JSON
      </button>
      {expanded && <pre className="json-content">{json}</pre>}
    </div>
  )
}

export default function StepCard({ step }) {
  const config = STEP_CONFIG[step.type] || STEP_CONFIG.error

  return (
    <div className={`step-card ${config.className}`}>
      <div className="step-header">
        <span className="step-icon">{config.icon}</span>
        <span className="step-label">{config.label}</span>
        {step.toolName && <span className="step-tool-name">{step.toolName}()</span>}
      </div>

      <div className="step-body">
        {step.type === 'user_message' && (
          <p className="step-text">{step.content}</p>
        )}

        {step.type === 'thinking' && (
          <p className="step-text step-text-muted">{step.content}</p>
        )}

        {step.type === 'tool_call' && (
          <>
            <p className="step-text">
              Calling <code>{step.toolName}</code> with:
            </p>
            <JsonBlock data={step.toolInput} defaultExpanded={true} />
          </>
        )}

        {step.type === 'tool_result' && (
          <>
            <p className="step-text">
              Result from <code>{step.toolName}</code>:
            </p>
            <JsonBlock data={step.result} defaultExpanded={true} />
          </>
        )}

        {step.type === 'assistant_text' && (
          <div className="step-text assistant-response">{step.content}</div>
        )}

        {step.type === 'error' && (
          <p className="step-text step-text-error">{step.content}</p>
        )}
      </div>
    </div>
  )
}

import { IconCheck } from './Icons';
import './StepIndicator.css';

const STEPS = [
  { key: 'type', label: 'Type', num: 1 },
  { key: 'participants', label: 'Participants', num: 2 },
  { key: 'brief', label: 'Brief', num: 3 },
];

export default function StepIndicator({ activeStep, completedSteps, onStepClick }) {
  return (
    <nav className="step-indicator">
      {STEPS.map((step, i) => {
        const isCompleted = completedSteps.includes(step.key);
        const isActive = activeStep === step.key;

        return (
          <button
            key={step.key}
            className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => onStepClick(step.key)}
          >
            <span className="step-num">
              {isCompleted ? <IconCheck size={12} /> : step.num}
            </span>
            <span className="step-label">{step.label}</span>
            {i < STEPS.length - 1 && <span className="step-connector" />}
          </button>
        );
      })}
    </nav>
  );
}

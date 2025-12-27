import { useEffect, useState } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action hint
}

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Government Structure Visualizer',
    description: 'This interactive visualization helps you explore the hierarchical structure of government agencies. Let us show you around!',
    target: '.react-flow',
    position: 'bottom',
  },
  {
    id: 'node-click',
    title: 'Click on Any Node',
    description: 'Click on any agency or ministry node to view detailed information including budget, type, and organizational hierarchy.',
    target: '.react-flow__node',
    position: 'right',
    action: 'Click here to try it',
  },
  {
    id: 'node-expand',
    title: 'Expand & Collapse Branches',
    description: 'Nodes with children show a (+) or (−) button. Click these to expand or collapse branches and explore deeper levels of the hierarchy.',
    target: '.react-flow__node',
    position: 'right',
    action: 'Look for (+) or (−) buttons',
  },
  {
    id: 'navigation',
    title: 'Navigate the Visualization',
    description: 'Drag to pan around the visualization, scroll to zoom in and out, and explore the entire government structure at your own pace.',
    target: '.react-flow',
    position: 'bottom',
    action: 'Try dragging and scrolling',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You now know the basics. Start exploring the government structure by clicking on nodes and navigating through the hierarchy.',
    target: '.react-flow',
    position: 'bottom',
  },
];

export default function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    let retryTimeoutId: number | null = null;

    // Find and highlight the target element
    const updateTargetPosition = () => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
        retryCount = 0; // Reset retry count on success
      } else if (retryCount < maxRetries) {
        // If element not found, try again after a short delay (with max retries)
        retryCount++;
        retryTimeoutId = window.setTimeout(updateTargetPosition, 100);
      }
    };

    // Initial update with a small delay to ensure DOM is ready
    const timeoutId = window.setTimeout(updateTargetPosition, 200);

    // Update position on window resize
    window.addEventListener('resize', updateTargetPosition);
    // Update position on scroll
    window.addEventListener('scroll', updateTargetPosition, true);

    return () => {
      clearTimeout(timeoutId);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
    };
  }, [step.target]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!targetRect) {
      // Center on screen if no target found
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 20;
    const tooltipWidth = 320;

    // For center positioning (welcome and complete steps)
    if (step.id === 'welcome' || step.id === 'complete') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    // For other steps, position relative to target
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Try to position to the right of the target
    let top = Math.max(20, Math.min(targetRect.top, viewportHeight - 300));
    let left = targetRect.right + padding;

    // If too far right, move to left side
    if (left + tooltipWidth > viewportWidth - 20) {
      left = Math.max(20, targetRect.left - tooltipWidth - padding);
    }

    // If still doesn't fit, center it
    if (left < 20 || left + tooltipWidth > viewportWidth - 20) {
      left = (viewportWidth - tooltipWidth) / 2;
    }

    return { top, left };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark overlay with spotlight effect - blocks all interactions */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={onSkip}>
        {/* Spotlight cutout - create a highlighted area around target */}
        {targetRect && step.id !== 'welcome' && step.id !== 'complete' && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] animate-pulse"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-lg shadow-2xl p-6 pointer-events-auto w-80"
        style={{
          ...tooltipPosition,
          maxWidth: 'calc(100vw - 40px)',
        }}
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-1 mb-4">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                index === currentStep ? 'bg-blue-500' : index < currentStep ? 'bg-blue-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-gray-600 leading-relaxed">{step.description}</p>
          {step.action && (
            <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-700">👆 {step.action}</p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip tutorial
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div className="mt-4 text-center text-xs text-gray-400">
          Step {currentStep + 1} of {ONBOARDING_STEPS.length}
        </div>
      </div>
    </div>
  );
}

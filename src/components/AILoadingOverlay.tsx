import { Sparkles, Brain, Pill, FileText, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AILoadingOverlayProps {
  isVisible: boolean;
}

export function AILoadingOverlay({ isVisible }: AILoadingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Brain, text: 'Analizando diagnóstico...', color: 'text-purple-600' },
    { icon: FileText, text: 'Consultando base médica...', color: 'text-blue-600' },
    { icon: Pill, text: 'Generando medicamentos...', color: 'text-pink-600' },
    { icon: CheckCircle2, text: 'Optimizando tratamiento...', color: 'text-green-600' },
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, steps.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-20 blur-xl animate-pulse" />
        
        <div className="relative space-y-6">
          {/* Header with sparkle animation */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 text-purple-600 animate-ping opacity-20">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              IA Generando Sugerencias
            </h3>
          </div>

          {/* Progress steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 scale-105'
                      : isCompleted
                      ? 'bg-green-50 dark:bg-green-950/20'
                      : 'bg-gray-50 dark:bg-gray-800/50 opacity-50'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 transition-all duration-300 ${
                      isActive ? 'animate-bounce' : ''
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isCompleted
                          ? 'text-green-600'
                          : isActive
                          ? step.color
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isCompleted
                        ? 'text-green-700 dark:text-green-400'
                        : isActive
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.text}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto animate-in zoom-in duration-200" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Animated progress bar */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Esto puede tomar unos segundos...
            </p>
          </div>

          {/* Pulsing dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"
                style={{
                  animationDelay: `${i * 200}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

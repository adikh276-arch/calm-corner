import { useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import ProgressDots from "@/components/ProgressDots";
import GroundingButton from "@/components/GroundingButton";
import StepInput from "@/components/StepInput";

const STEPS = [
  {
    heading: null,
    body: `Let's take a short pause together.\n\nFor the next minute, there's nothing you need to solve, fix, or respond to. Just allow yourself to slow down.\n\nSit comfortably, place your feet on the ground if you can, and gently take a slow breath in… and slowly breathe out.\n\nThis is your moment to reset and reconnect with the present.`,
    inputCount: 0,
    button: "Begin",
  },
  {
    heading: "5 Things You Can See",
    body: "Slowly look around you. Let your eyes move gently across the space. Notice colors, shapes, light, shadows, or small details you may not have paid attention to before.",
    inputCount: 5,
    button: "Next",
  },
  {
    heading: "4 Things You Can Feel",
    body: "Bring your attention to your body. Feel your feet touching the floor, your back against the chair, your clothes on your skin, or the air around you. Acknowledge four physical sensations.",
    inputCount: 4,
    button: "Next",
  },
  {
    heading: "3 Things You Can Hear",
    body: "Listen carefully. You might hear distant sounds, a fan, typing, breathing, or even silence. Identify three sounds without judging them.",
    inputCount: 3,
    button: "Next",
  },
  {
    heading: "2 Things You Can Smell",
    body: "See if you can detect any scent in the room. If nothing stands out, simply notice the neutral smell of the air around you.",
    inputCount: 2,
    button: "Next",
  },
  {
    heading: "1 Thing You Can Taste",
    body: "Pay attention to the taste in your mouth. It could be subtle or neutral — just observe it.",
    inputCount: 1,
    button: "Next",
  },
  {
    heading: "Reflection",
    body: "Take one slow breath in… and gently breathe out.",
    inputCount: 0,
    button: "Submit",
    reflectionPrompt: true,
  },
];

const TOTAL_STEPS = STEPS.length;

const GroundingExercise = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string[]>>({});
  const [reflectionWord, setReflectionWord] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const step = STEPS[currentStep];

  const handleNext = useCallback(() => {
    if (currentStep === TOTAL_STEPS - 1) {
      setSubmitted(true);
      return;
    }
    setCurrentStep((s) => s + 1);
    setAnimKey((k) => k + 1);
  }, [currentStep]);

  const handleInputChange = (values: string[]) => {
    setResponses((prev) => ({ ...prev, [currentStep]: values }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-md fade-in">
          <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-8 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-foreground">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-light text-foreground mb-4">
            {t('completed.title')}
          </h2>
          {reflectionWord && (
            <p className="font-body text-muted-foreground text-sm mb-6">
              {t('completed.youFeel')} <span className="text-foreground font-medium italic">{reflectionWord}</span>
            </p>
          )}
          <p className="font-body text-muted-foreground text-sm leading-relaxed mb-10">
            {t('completed.message')}
          </p>
          <GroundingButton
            variant="secondary"
            onClick={() => {
              setCurrentStep(0);
              setResponses({});
              setReflectionWord("");
              setSubmitted(false);
              setAnimKey((k) => k + 1);
            }}
          >
            {t('completed.startAgain')}
          </GroundingButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Breathing circle background decoration */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-accent/50 breathing-circle" />
      </div>

      {/* Progress */}
      <div className="relative z-10 pt-8 px-6 flex justify-center">
        <ProgressDots total={TOTAL_STEPS} current={currentStep} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12" key={animKey}>
        <div className="max-w-lg w-full text-center">
          {/* Step number badge for sense steps */}
          {step.inputCount > 0 && (
            <div className="fade-in mb-6">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-display text-lg">
                {step.inputCount}
              </span>
            </div>
          )}

          {/* Heading */}
          {step.heading && (
            <h1 className="font-display text-3xl md:text-4xl font-light text-foreground mb-6 fade-in">
              {typeof step.heading === 'string' ? t(`steps.${currentStep}.heading`) : null}
            </h1>
          )}

          {/* Body text */}
          <div className="fade-in-delayed">
            {t(`steps.${currentStep}.body`).split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className={`font-body text-sm md:text-base leading-relaxed text-muted-foreground ${i < step.body.split("\n\n").length - 1 ? "mb-4" : "mb-8"
                  } ${currentStep === 0 ? "text-base md:text-lg" : ""}`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Inputs for sense steps */}
          {step.inputCount > 0 && (
            <div className="mb-8 fade-in-delayed">
              <StepInput
                count={step.inputCount}
                values={responses[currentStep] || []}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Reflection input */}
          {step.reflectionPrompt && (
            <div className="mb-8 fade-in-delayed max-w-sm mx-auto">
              <p className="font-body text-xs text-muted-foreground mb-3 tracking-wide uppercase">
                {t('reflection.prompt')}
              </p>
              <input
                type="text"
                value={reflectionWord}
                onChange={(e) => setReflectionWord(e.target.value)}
                placeholder={t('reflection.placeholder')}
                className="w-full bg-card border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
              />
            </div>
          )}

          {/* Action button */}
          <div className="fade-in-delayed" style={{ animationDelay: "0.5s" }}>
            <GroundingButton onClick={handleNext}>
              {t(`steps.${currentStep}.button`)}
            </GroundingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundingExercise;

"use client";

const steps = [
  "Basic Details",
  "Contact",
  "Social Links",
  "Services",
  "Gallery",
  "QR Code",
  "Publish",
];

interface Props {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export default function StepNavigation({
  currentStep,
  setCurrentStep,
}: Props) {
  return (
    <div className="flex w-full items-center justify-between">
      {steps.map((label, index) => {
        const stepNumber = index + 1;

        const active = currentStep === stepNumber;

        const completed = currentStep > stepNumber;

        return (
          <button
            key={label}
            type="button"
            onClick={() => setCurrentStep(stepNumber)}
            aria-label={`Step ${stepNumber}: ${label}`}
            className="relative flex flex-1 items-center justify-center"
          >
            {/* =================================================
                CONNECTING LINE
            ================================================== */}

            {stepNumber < steps.length && (
              <div
                className={[
                  "absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2",
                  completed
                    ? "bg-[#1E3A5F]"
                    : "bg-[#E5E0D9]",
                ].join(" ")}
              />
            )}

            {/* =================================================
                STEP CIRCLE
            ================================================== */}

            <div
              className={[
                "relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border text-[13px] leading-none font-medium transition-all",
                active
                  ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                  : completed
                    ? "border-[#1E3A5F] bg-[#E5E0D9] text-[#1E3A5F]"
                    : "border-[#E5E0D9] bg-white text-[#77736E]",
              ].join(" ")}
            >
              {completed ? "✓" : stepNumber}
            </div>
          </button>
        );
      })}
    </div>
  );
}
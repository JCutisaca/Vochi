"use client";
type SpeakerState = "ai" | "user";

interface VoiceVisualizerProps {
  state: SpeakerState;
  visualizerData: number[];
}

export function VoiceVisualizer({
  state,
  visualizerData,
}: VoiceVisualizerProps) {
  const isAI = state === "ai";

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
      <div
        className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
          isAI ? "border-primary/40 animate-pulse" : "border-foreground/20"
        }`}
      />
      <div
        className={`absolute inset-8 rounded-full border transition-all duration-500 ${
          isAI ? "border-primary/20" : "border-foreground/10"
        }`}
      />

      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full"
        dir="rtl"
      >
        <div className="flex items-center gap-0.5 h-16">
          {visualizerData
            .slice(-40)
            .reverse()
            .map((rms, i) => (
              <div key={i} className="flex items-center h-full">
                <div
                  className={`w-[2px] shrink-0 rounded-full transition-all ${
                    isAI ? "bg-primary" : "bg-foreground/40"
                  }`}
                  style={{
                    height: `${Math.min(100, Math.max(14, rms * 100))}%`,
                    opacity: isAI ? 0.7 + Math.sin(i * 0.5) * 0.3 : 0.4,
                  }}
                />
              </div>
            ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-1">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isAI ? "bg-primary/20" : "bg-foreground/10"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              isAI
                ? "bg-primary text-primary-foreground"
                : "bg-foreground text-background"
            }`}
          >
            {isAI ? "IA" : "Vos"}
          </div>
        </div>
      </div>
    </div>
  );
}

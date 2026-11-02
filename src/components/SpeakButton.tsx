"use client";

export function SpeakButton({ text, lang = "en-US" }: { text: string; lang?: string }) {
  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Ouvir "${text}"`}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-light text-brand-blue-dark hover:bg-brand-blue hover:text-white"
    >
      🔊
    </button>
  );
}

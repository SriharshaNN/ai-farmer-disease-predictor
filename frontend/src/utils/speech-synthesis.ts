const LANG_MAP: Record<string, string> = {
    en: 'en-IN',
    kn: 'kn-IN',
    hi: 'hi-IN',
    te: 'te-IN',
};

export function isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText(text: string, langCode: string): void {
    if (!isSpeechSupported()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[langCode] || 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const targetLang = LANG_MAP[langCode] || 'en-IN';
    const matchingVoice = voices.find(v => v.lang === targetLang) ||
        voices.find(v => v.lang.startsWith(langCode)) ||
        voices.find(v => v.lang.startsWith('en'));

    if (matchingVoice) {
        utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
    if (!isSpeechSupported()) return;
    window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
    if (!isSpeechSupported()) return false;
    return window.speechSynthesis.speaking;
}

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

export const SoundModule = {
    speak(text) {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    },
    playBeep(frequency = 440, duration = 150, type = 'sine') {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration / 1000);
        } catch (e) {
            console.warn('Audio no disponible', e);
        }
    },
    playTick() {
        this.playBeep(400, 100, 'sine');
    },

    playFinished() {
        this.speak('¡Entrenamiento completado! Excelente trabajo.');
    }
};
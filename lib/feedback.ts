/**
 * Shared utility for haptic and audio feedback.
 */

export const HAPTIC_TYPES = {
    LIGHT: 'light',
    MEDIUM: 'medium',
    HEAVY: 'heavy',
    SUCCESS: 'success',
} as const;

export type HapticType = typeof HAPTIC_TYPES[keyof typeof HAPTIC_TYPES];

/**
 * Trigger haptic vibration on supporting devices.
 */
export const triggerHaptic = (type: HapticType = 'light') => {
    if (typeof window === 'undefined' || !('vibrate' in window.navigator)) return;
    try {
        switch (type) {
            case 'light': navigator.vibrate(10); break;
            case 'medium': navigator.vibrate(20); break;
            case 'heavy': navigator.vibrate(30); break;
            case 'success': navigator.vibrate([15, 50, 20]); break;
        }
    } catch (e) { }
};

/**
 * Play a subtle iPhone-style "tick" or "pop" sound using Web Audio API.
 * This avoids needing external MP3 files and is extremely low latency.
 */
export const playFeedbackSound = (type: 'tick' | 'tap' = 'tick') => {
    if (typeof window === 'undefined') return;

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'tick') {
            // High-pitched short "tick"
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        } else {
            // Lower "tap"
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        }

        osc.start(now);
        osc.stop(now + 0.1);
    } catch (e) {
        // Audio might be blocked by browser policy until user interacts
        console.debug('Feedback sound blocked or failed:', e);
    }
};

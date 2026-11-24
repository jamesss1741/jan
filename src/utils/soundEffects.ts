// Web Audio API Synthesizer for Native Android Healthcare Notification Sounds
// Zero external mp3 dependencies - 100% reliable offline

export type NotificationTone = 'bell' | 'pulse' | 'zen' | 'beep';

export const NOTIFICATION_TONES: { id: NotificationTone; name: string; description: string }[] = [
  { id: 'bell', name: 'Gentle Vedic Bell (432Hz)', description: 'Calm harmonic tone recommended for morning doses' },
  { id: 'pulse', name: 'Modern Digital Pulse', description: 'Crisp double-ping for busy schedules' },
  { id: 'zen', name: 'Zen Singing Bowl', description: 'Deep resonant tone for evening relaxation' },
  { id: 'beep', name: 'Classic Clinic Beep', description: 'High-contrast medical alert' },
];

export function playReminderTone(tone: NotificationTone = 'bell') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (tone === 'bell') {
      // 432 Hz gentle chime with decaying sine
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(864, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(432, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else if (tone === 'pulse') {
      // Crisp two-tone pulse
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.25, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.2);
      });
    } else if (tone === 'zen') {
      // Resonant 528 Hz transformation frequency
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.6);
    } else if (tone === 'beep') {
      // Standard medical alert beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

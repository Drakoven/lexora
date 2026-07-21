const SOUND_ENABLED_KEY = "lexora_sound_enabled";

let audioContext = null;

export function isSoundEnabled() {
  return localStorage.getItem(SOUND_ENABLED_KEY) !== "0";
}

export function setSoundEnabled(enabled) {
  localStorage.setItem(SOUND_ENABLED_KEY, enabled ? "1" : "0");
}

function getContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone({ frequency, duration, type, gain }) {
  if (!isSoundEnabled()) return;

  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export function playTileClickSound() {
  playTone({ frequency: 850, duration: 0.07, type: "sine", gain: 0.12 });
}

export function playCellClickSound() {
  playTone({ frequency: 380, duration: 0.11, type: "triangle", gain: 0.15 });
}

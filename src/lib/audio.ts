/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Native Web Audio API Sound Synthesizer for Retro Arcade Effects
// No external asset dependencies - completely synthesized in real-time.

let audioCtx: AudioContext | null = null;
let musicInterval: any = null;
let musicOscillators: OscillatorNode[] = [];
let sizzleSource: AudioWorkletNode | ScriptProcessorNode | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: 'click' | 'coin' | 'chime' | 'ding' | 'fail' | 'sweep' | 'powerup') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      case 'coin': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'chime': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.25);
        break;
      }
      case 'ding': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.setValueAtTime(1760, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }
      case 'fail': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'sweep': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'powerup': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(261.63, now); // C4
        osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.3); // C5
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(329.63, now); // E4
        osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.3); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
        break;
      }
    }
  } catch (e) {
    console.warn("Web Audio API not supported or interaction blocked:", e);
  }
}

// Cooking grill sizzle white noise synthesizer
export function startSizzle() {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 1; // 1 second buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to make it sound like sizzle (bandpass filter)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 5000;
    filter.Q.value = 1.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.015, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    (window as any).sizzleNode = noise;
    (window as any).sizzleGain = gain;
  } catch (e) {
    console.warn("Could not start sizzle:", e);
  }
}

export function stopSizzle() {
  try {
    if ((window as any).sizzleNode) {
      (window as any).sizzleNode.stop();
      (window as any).sizzleNode = null;
    }
  } catch (e) {}
}

// Background retro-wave synthetic loops
export function startMusic() {
  if (musicInterval) return;
  try {
    const ctx = getAudioContext();
    
    // Soft bass & melody loop
    const notes = [
      110.00, 110.00, 130.81, 146.83, // A2, A2, C3, D3
      110.00, 110.00, 164.81, 146.83, // A2, A2, E3, D3
      110.00, 110.00, 130.81, 146.83, // A2, A2, C3, D3
      98.00, 98.00, 123.47, 146.83,   // G2, G2, B2, D3
    ];
    
    const leadNotes = [
      440.00, 0, 440.00, 493.88, 523.25, 0, 523.25, 587.33,
      440.00, 0, 440.00, 493.88, 392.00, 0, 392.00, 329.63
    ];

    let beat = 0;
    
    musicInterval = setInterval(() => {
      try {
        const now = ctx.currentTime;
        
        // Play Bass (always)
        const bassHz = notes[beat % notes.length];
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassHz, now);
        bassGain.gain.setValueAtTime(0.025, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.3);
        
        // Play melodic accent every 2 beats
        if (beat % 2 === 0) {
          const leadHz = leadNotes[(beat / 2) % leadNotes.length];
          if (leadHz > 0) {
            const leadOsc = ctx.createOscillator();
            const leadGain = ctx.createGain();
            leadOsc.type = 'sine';
            leadOsc.frequency.setValueAtTime(leadHz, now);
            leadGain.gain.setValueAtTime(0.015, now);
            leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            leadOsc.connect(leadGain);
            leadGain.connect(ctx.destination);
            leadOsc.start(now);
            leadOsc.stop(now + 0.5);
          }
        }
        
        beat++;
      } catch (e) {
        console.warn("Audio Context issue in music loop:", e);
      }
    }, 320); // 187.5 BPM retro pulse

  } catch (e) {
    console.warn("Could not launch synthetic music background:", e);
  }
}

export function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

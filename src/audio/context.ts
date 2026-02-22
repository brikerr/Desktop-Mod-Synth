let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    throw new Error('AudioContext not initialized. Call initAudioContext() first.');
  }
  return audioContext;
}

export async function initAudioContext(): Promise<AudioContext> {
  if (audioContext) {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return audioContext;
  }
  audioContext = new AudioContext({ sampleRate: 44100 });
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  return audioContext;
}

export function isAudioContextReady(): boolean {
  return audioContext !== null && audioContext.state === 'running';
}

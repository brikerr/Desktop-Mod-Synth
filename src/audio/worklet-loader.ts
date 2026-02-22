import vcoUrl from './processors/vco-processor.ts?url';
import vcfUrl from './processors/vcf-processor.ts?url';
import vcaUrl from './processors/vca-processor.ts?url';
import envelopeUrl from './processors/envelope-processor.ts?url';
import lfoUrl from './processors/lfo-processor.ts?url';
import mixerUrl from './processors/mixer-processor.ts?url';
import keyboardUrl from './processors/keyboard-processor.ts?url';
import outputUrl from './processors/output-processor.ts?url';
import noiseUrl from './processors/noise-processor.ts?url';
import delayUrl from './processors/delay-processor.ts?url';
import reverbUrl from './processors/reverb-processor.ts?url';
import oscilloscopeUrl from './processors/oscilloscope-processor.ts?url';

const processorUrls = [
  vcoUrl,
  vcfUrl,
  vcaUrl,
  envelopeUrl,
  lfoUrl,
  mixerUrl,
  keyboardUrl,
  outputUrl,
  noiseUrl,
  delayUrl,
  reverbUrl,
  oscilloscopeUrl,
];

export async function loadAllProcessors(ctx: AudioContext): Promise<void> {
  await Promise.all(processorUrls.map((url) => ctx.audioWorklet.addModule(url)));
}

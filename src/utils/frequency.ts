export const MIN_CUTOFF = 20;
export const MAX_CUTOFF = 20000;
export const SLIDER_MAX = 1000;

export function sliderToFreq(value: number) {
  const minLog = Math.log10(MIN_CUTOFF);
  const maxLog = Math.log10(MAX_CUTOFF);
  const fraction = value / SLIDER_MAX;
  const freqLog = minLog + fraction * (maxLog - minLog);
  return Math.pow(10, freqLog);
}

export function freqToSlider(freq: number) {
  const minLog = Math.log10(MIN_CUTOFF);
  const maxLog = Math.log10(MAX_CUTOFF);
  const freqLog = Math.log10(freq);
  const fraction = (freqLog - minLog) / (maxLog - minLog);
  return fraction * SLIDER_MAX;
}

// src/audio/utils/midi.ts

export function midiNoteToName(noteNumber: number) {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(noteNumber / 12) - 1;
  const noteName = notes[noteNumber % 12];
  return `${noteName}${octave}`;
}

export function midiNoteToFreq(noteNumber: number) {
  // A4 = MIDI 69 = 440Hz
  return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

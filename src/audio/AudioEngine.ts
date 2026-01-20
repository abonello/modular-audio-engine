/*
 * src/audio/AudioEngine.ts
 * This is the local backend that interprets the JSON.
 */

import { Patch } from "../model/PatchTypes";

export class AudioEngine {
  private context: AudioContext;

  constructor() {
    this.context = new AudioContext();
  }

  async start() {
    // required for browser autoplay restrictions
    await this.context.resume();
  }

  loadPatch(patch: Patch) {
    console.log("Loading patch:", patch);
    // TODO: implement node creation + connections
  }
}

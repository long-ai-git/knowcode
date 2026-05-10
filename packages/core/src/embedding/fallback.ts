import type { Embedder } from './embedder';

export class FallbackEmbedder implements Embedder {
  private dimensions: number = 384;

  async embed(text: string): Promise<number[]> {
    const hash = this.simpleHash(text);
    const vector = new Array(this.dimensions).fill(0);
    
    for (let i = 0; i < this.dimensions; i++) {
      vector[i] = this.charHash(hash, i);
    }
    
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(v => v / norm);
  }

  getDimensions(): number {
    return this.dimensions;
  }

  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private charHash(seed: number, index: number): number {
    const x = Math.sin(seed * (index + 1) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
}
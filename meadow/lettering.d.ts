// Types for lettering.js (the canvas renderer that draws the name three times for the line boil).

export type LetteringSpec = {
  label: string;
  family: string;
  weight: number;
  leading: number;
  tracking: number;
  /** How far the three passes stray from each other: 0 still, 1 gentle, 1.8 lively. */
  boil: number;
};

export type Align = 'left' | 'right' | 'center';

/** Transparent margin around the ink, as a fraction of the ink width. */
export const BLEED: number;
export const LETTERING: LetteringSpec;

export function fontLoaded(spec: LetteringSpec, text: string): boolean;
export function fontsReady(spec: LetteringSpec, text: string): Promise<unknown>;

export function renderGuide(
  spec: LetteringSpec,
  lines: string[],
  align: Align,
  inkWidth?: number,
): HTMLCanvasElement;

export function artBox(
  naturalWidth: number,
  naturalHeight: number,
): { aspect: number; bleedY: number };

export function renderFrames(
  spec: LetteringSpec,
  lines: string[],
  align: Align,
  inkWidth: number,
  ink: [number, number, number],
  count?: number,
): {
  frames: HTMLCanvasElement[];
  pad: number;
  inkW: number;
  inkH: number;
  em: number;
};

export function silhouette(
  source: HTMLCanvasElement | HTMLImageElement,
  colour: string,
  maxWidth?: number,
): HTMLCanvasElement;

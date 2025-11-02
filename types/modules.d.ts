declare module 'pixelmatch' {
  export interface PixelmatchOptions {
    threshold?: number;
    includeAA?: boolean;
    alpha?: number;
    aaColor?: [number, number, number];
    diffColor?: [number, number, number];
    diffColorAlt?: [number, number, number];
    diffMask?: boolean;
  }

  const pixelmatch: (
    img1: Buffer | Uint8Array,
    img2: Buffer | Uint8Array,
    output: Buffer | Uint8Array,
    width: number,
    height: number,
    options?: PixelmatchOptions
  ) => number;

  export default pixelmatch;
}

declare module 'pngjs' {
  export interface PNGOptions {
    width?: number;
    height?: number;
    fill?: boolean;
    filterType?: number;
    colorType?: number;
    bitDepth?: number;
    inputHasAlpha?: boolean;
  }

  export class PNG {
    width: number;
    height: number;
    data: Buffer;

    static bitblt(
      src: PNG,
      dst: PNG,
      sx: number,
      sy: number,
      width: number,
      height: number,
      dx: number,
      dy: number
    ): PNG;

    static sync: {
      read(buffer: Buffer): PNG;
      write(png: PNG): Buffer;
    };

    constructor(options?: PNGOptions);

    pack(): NodeJS.ReadableStream;
    parse(data: Buffer, callback?: (error: Error | null, data: PNG) => void): NodeJS.ReadWriteStream;
    on(event: 'metadata', callback: (metadata: Record<string, unknown>) => void): this;
    on(event: 'parsed', callback: () => void): this;
  }
}

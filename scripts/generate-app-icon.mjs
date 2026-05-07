import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(repoRoot, 'resources', 'icon.ico');
const iconSizes = [16, 24, 32, 48, 64, 128, 256];

const palette = {
  canvas: rgba('#11141c'),
  canvasInset: rgba('#0b0d12'),
  border: rgba('#2a3140'),
  accent: rgba('#7b6ff0'),
  success: rgba('#45c980'),
  textSecondary: rgba('#8b95a8')
};

function rgba(hex, alpha = 255) {
  const normalized = hex.replace('#', '');
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
    alpha
  ];
}

function blendPixel(canvas, size, x, y, color) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= size || py >= size) {
    return;
  }

  const index = (py * size + px) * 4;
  const sourceAlpha = color[3] / 255;
  const targetAlpha = canvas[index + 3] / 255;
  const outputAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);

  if (outputAlpha === 0) {
    return;
  }

  canvas[index] = Math.round((color[0] * sourceAlpha + canvas[index] * targetAlpha * (1 - sourceAlpha)) / outputAlpha);
  canvas[index + 1] = Math.round((color[1] * sourceAlpha + canvas[index + 1] * targetAlpha * (1 - sourceAlpha)) / outputAlpha);
  canvas[index + 2] = Math.round((color[2] * sourceAlpha + canvas[index + 2] * targetAlpha * (1 - sourceAlpha)) / outputAlpha);
  canvas[index + 3] = Math.round(outputAlpha * 255);
}

function fillRoundedRect(canvas, size, x, y, width, height, radius, color) {
  const right = x + width;
  const bottom = y + height;

  for (let py = Math.floor(y); py <= Math.ceil(bottom); py += 1) {
    for (let px = Math.floor(x); px <= Math.ceil(right); px += 1) {
      const closestX = Math.max(x + radius, Math.min(px, right - radius));
      const closestY = Math.max(y + radius, Math.min(py, bottom - radius));
      const dx = px - closestX;
      const dy = py - closestY;

      if (dx * dx + dy * dy <= radius * radius) {
        blendPixel(canvas, size, px, py, color);
      }
    }
  }
}

function fillCircle(canvas, size, cx, cy, radius, color) {
  for (let py = Math.floor(cy - radius); py <= Math.ceil(cy + radius); py += 1) {
    for (let px = Math.floor(cx - radius); px <= Math.ceil(cx + radius); px += 1) {
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        blendPixel(canvas, size, px, py, color);
      }
    }
  }
}

function strokeLine(canvas, size, x1, y1, x2, y2, width, color) {
  const halfWidth = width / 2;
  const minX = Math.floor(Math.min(x1, x2) - halfWidth);
  const maxX = Math.ceil(Math.max(x1, x2) + halfWidth);
  const minY = Math.floor(Math.min(y1, y2) - halfWidth);
  const maxY = Math.ceil(Math.max(y1, y2) + halfWidth);
  const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;

  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const t = lengthSquared === 0
        ? 0
        : Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lengthSquared));
      const projectedX = x1 + t * (x2 - x1);
      const projectedY = y1 + t * (y2 - y1);
      const dx = px - projectedX;
      const dy = py - projectedY;

      if (dx * dx + dy * dy <= halfWidth * halfWidth) {
        blendPixel(canvas, size, px, py, color);
      }
    }
  }

  fillCircle(canvas, size, x1, y1, halfWidth, color);
  fillCircle(canvas, size, x2, y2, halfWidth, color);
}

function drawIcon(size) {
  const canvas = Buffer.alloc(size * size * 4);
  const s = size / 256;

  fillRoundedRect(canvas, size, 14 * s, 14 * s, 228 * s, 228 * s, 42 * s, palette.border);
  fillRoundedRect(canvas, size, 22 * s, 22 * s, 212 * s, 212 * s, 34 * s, palette.canvas);

  fillRoundedRect(canvas, size, 48 * s, 56 * s, 160 * s, 118 * s, 18 * s, palette.accent);
  fillRoundedRect(canvas, size, 56 * s, 64 * s, 144 * s, 102 * s, 10 * s, palette.canvasInset);
  strokeLine(canvas, size, 60 * s, 89 * s, 196 * s, 89 * s, 7 * s, palette.border);

  fillCircle(canvas, size, 76 * s, 74 * s, 5 * s, palette.textSecondary);
  fillCircle(canvas, size, 94 * s, 74 * s, 5 * s, palette.textSecondary);

  strokeLine(canvas, size, 116 * s, 142 * s, 148 * s, 174 * s, 18 * s, palette.success);
  strokeLine(canvas, size, 148 * s, 174 * s, 211 * s, 86 * s, 18 * s, palette.success);

  return canvas;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function pngFromRgba(size, rgbaBuffer) {
  const raw = Buffer.alloc((size * 4 + 1) * size);

  for (let y = 0; y < size; y += 1) {
    const rawOffset = y * (size * 4 + 1);
    raw[rawOffset] = 0;
    rgbaBuffer.copy(raw, rawOffset + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function icoFromPngs(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = Buffer.alloc(images.length * 16);
  let offset = header.length + entries.length;

  images.forEach((image, index) => {
    const entryOffset = index * 16;
    entries[entryOffset] = image.size === 256 ? 0 : image.size;
    entries[entryOffset + 1] = image.size === 256 ? 0 : image.size;
    entries[entryOffset + 2] = 0;
    entries[entryOffset + 3] = 0;
    entries.writeUInt16LE(1, entryOffset + 4);
    entries.writeUInt16LE(32, entryOffset + 6);
    entries.writeUInt32LE(image.png.length, entryOffset + 8);
    entries.writeUInt32LE(offset, entryOffset + 12);
    offset += image.png.length;
  });

  return Buffer.concat([header, entries, ...images.map((image) => image.png)]);
}

const images = iconSizes.map((size) => ({
  size,
  png: pngFromRgba(size, drawIcon(size))
}));

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, icoFromPngs(images));
console.log(`Generated ${outputPath}`);

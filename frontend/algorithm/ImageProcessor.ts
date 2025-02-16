import { toByteArray } from "base64-js";
import { Image } from "react-native";
import Canvas from "react-native-canvas";

interface Point {
  x: number;
  y: number;
}

interface BoundingBox {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

// function base64Conversion(base64: string): Uint8ClampedArray {
//   const byteArray = toByteArray(base64); // Converts base64 to Uint8Array
//   return new Uint8ClampedArray(byteArray.buffer); // Convert to Uint8ClampedArray
// }

// const base64ToUint8ClampedArray = (base64: string): Uint8ClampedArray => {
//   const binaryString = atob(base64); // Decode base64 string
//   const len = binaryString.length;
//   const bytes = new Uint8Array(len);

//   for (let i = 0; i < len; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }

//   return new Uint8ClampedArray(bytes.buffer);
// };

const toGrayscale = (canvas: Canvas): Uint8ClampedArray => {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const grayscale = new Uint8ClampedArray(width * height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    grayscale[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  return grayscale;
};

function applySobel(
  gray: Uint8ClampedArray,
  width: number,
  height: number
): Float32Array {
  const G = new Float32Array(gray.length);
  const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = gray[(y + ky) * width + (x + kx)];
          const kernelIndex = (ky + 1) * 3 + (kx + 1);
          sumX += pixel * kernelX[kernelIndex];
          sumY += pixel * kernelY[kernelIndex];
        }
      }
      const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
      G[y * width + x] = magnitude;
    }
  }
  return G;
}

function detectBoundingBox(
  sobelData: Float32Array,
  width: number,
  height: number,
  threshold: number
): BoundingBox {
  let minX = width,
    minY = height;
  let maxX = 0,
    maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (sobelData[y * width + x] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    topLeft: { x: minX, y: minY },
    topRight: { x: maxX, y: minY },
    bottomRight: { x: maxX, y: maxY },
    bottomLeft: { x: minX, y: maxY },
  };
}

export async function processFrame(
  canvas: Canvas,
  width: number,
  height: number
): Promise<BoundingBox> {
  try {
    const gray = toGrayscale(canvas);
    const sobelData = applySobel(gray, width, height);
    return detectBoundingBox(sobelData, width, height, 100);
  } catch (error) {
    console.error("Error processing frame:", error);
    return {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
    };
  }
}

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

export function grayscale(imageData: ImageData): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(imageData.width * imageData.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg =
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    gray[i / 4] = avg;
  }
  return gray;
}

export function applySobel(
  gray: Uint8ClampedArray,
  width: number,
  height: number
): Float32Array {
  const G = new Float32Array(width * height);
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

export function detectBoundingBox(
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

// Generate the JavaScript code to be injected into WebView
export const generateInjectedJavaScript = () => `
  ${grayscale.toString()}
  ${applySobel.toString()}
  ${detectBoundingBox.toString()}

  let isTracking = false;
  let processingFrame = false;

  function processImage(data) {
    const { uri, isTracking: tracking } = JSON.parse(data);
    isTracking = tracking;

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      if (isTracking) {
        processFrame(ctx, canvas.width, canvas.height);
      }
    };
    
    img.src = uri;
  }

  function processFrame(ctx, width, height) {
    if (!isTracking || processingFrame) return;
    processingFrame = true;

    const imageData = ctx.getImageData(0, 0, width, height);
    const gray = grayscale(imageData);
    const sobelData = applySobel(gray, width, height);
    const box = detectBoundingBox(sobelData, width, height, 100);

    // Convert bounding box to simplified format
    const boundingBox = {
      x: box.topLeft.x,
      y: box.topLeft.y,
      width: box.topRight.x - box.topLeft.x,
      height: box.bottomLeft.y - box.topLeft.y
    };

    // Send results back to React Native
    window.ReactNativeWebView.postMessage(JSON.stringify({ boundingBox }));
    
    processingFrame = false;
    
    // Continue processing if still tracking
    if (isTracking) {
      requestAnimationFrame(() => processFrame(ctx, width, height));
    }
  }

  // Listen for messages from React Native
  document.addEventListener("message", function(event) {
    processImage(event.data);
  });
  window.addEventListener("message", function(event) {
    processImage(event.data);
  });
`;

export const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body, html { margin:0; padding:0; overflow: hidden; }
      canvas { display: none; }
    </style>
  </head>
  <body>
    <canvas id="canvas"></canvas>
  </body>
</html>
`;

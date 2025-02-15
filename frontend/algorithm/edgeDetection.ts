// interface Point {
//   x: number;
//   y: number;
// }

// // Convert image to grayscale.
// function grayscale(imageData: ImageData): Uint8ClampedArray {
//   const gray = new Uint8ClampedArray(imageData.width * imageData.height);
//   for (let i = 0; i < imageData.data.length; i += 4) {
//     const avg =
//       (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
//     gray[i / 4] = avg;
//   }
//   return gray;
// }

// // Apply a simple Sobel operator to compute a gradient magnitude image.
// function applySobel(
//   gray: Uint8ClampedArray,
//   width: number,
//   height: number
// ): Float32Array {
//   const G = new Float32Array(width * height);
//   const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
//   const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

//   for (let y = 1; y < height - 1; y++) {
//     for (let x = 1; x < width - 1; x++) {
//       let sumX = 0;
//       let sumY = 0;
//       for (let ky = -1; ky <= 1; ky++) {
//         for (let kx = -1; kx <= 1; kx++) {
//           const pixel = gray[(y + ky) * width + (x + kx)];
//           const kernelIndex = (ky + 1) * 3 + (kx + 1);
//           sumX += pixel * kernelX[kernelIndex];
//           sumY += pixel * kernelY[kernelIndex];
//         }
//       }
//       const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
//       G[y * width + x] = magnitude;
//     }
//   }
//   return G;
// }

// // Detect a bounding box from the Sobel edge data using a simple threshold.
// function detectBoundingBox(
//   sobelData: Float32Array,
//   width: number,
//   height: number,
//   threshold: number
// ): {
//   topLeft: Point;
//   topRight: Point;
//   bottomRight: Point;
//   bottomLeft: Point;
// } {
//   let minX = width,
//     minY = height;
//   let maxX = 0,
//     maxY = 0;
//   for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//       if (sobelData[y * width + x] > threshold) {
//         if (x < minX) minX = x;
//         if (x > maxX) maxX = x;
//         if (y < minY) minY = y;
//         if (y > maxY) maxY = y;
//       }
//     }
//   }

//   return {
//     topLeft: { x: minX, y: minY },
//     topRight: { x: maxX, y: minY },
//     bottomRight: { x: maxX, y: maxY },
//     bottomLeft: { x: minX, y: maxY },
//   };
// }

// // Main function: Process the image, detect corners, and draw the bounding box.
// // Note: This version is adapted for react-native-canvas. The image parameter is expected
// // to be an instance of the Canvas image (e.g. new canvas.Image()), and canvas is the react-native-canvas.
// export function processImage(
//   image: any,
//   canvas: any
// ): {
//   corners: {
//     topLeft: Point;
//     topRight: Point;
//     bottomRight: Point;
//     bottomLeft: Point;
//   };
//   context: CanvasRenderingContext2D;
// } {
//   // Set canvas dimensions to match the image dimensions.
//   canvas.width = image.width;
//   canvas.height = image.height;

//   const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
//   ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

//   let imageData: ImageData;
//   try {
//     // getImageData may not be implemented in react-native-canvas.
//     imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//   } catch (error) {
//     throw new Error(
//       "getImageData is not supported on react-native-canvas. Consider adding a polyfill."
//     );
//   }

//   // Convert to grayscale.
//   const gray = grayscale(imageData);
//   // Apply the Sobel operator to get edge magnitudes.
//   const sobelData = applySobel(gray, canvas.width, canvas.height);
//   // Detect the bounding box from edges. Adjust threshold as needed.
//   const boundingBox = detectBoundingBox(
//     sobelData,
//     canvas.width,
//     canvas.height,
//     100
//   );

//   // Draw the bounding box (red rectangle).
//   ctx.strokeStyle = "red";
//   ctx.lineWidth = 2;
//   ctx.beginPath();
//   ctx.moveTo(boundingBox.topLeft.x, boundingBox.topLeft.y);
//   ctx.lineTo(boundingBox.topRight.x, boundingBox.topRight.y);
//   ctx.lineTo(boundingBox.bottomRight.x, boundingBox.bottomRight.y);
//   ctx.lineTo(boundingBox.bottomLeft.x, boundingBox.bottomLeft.y);
//   ctx.closePath();
//   ctx.stroke();

//   return { corners: boundingBox, context: ctx };
// }

export const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Edge Detection</title>
    <style>
      body, html { margin:0; padding:0; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <canvas id="canvas"></canvas>
    <script>
      // Convert image to grayscale.
      function grayscale(imageData) {
        var gray = new Uint8ClampedArray(imageData.width * imageData.height);
        for (var i = 0; i < imageData.data.length; i += 4) {
          var avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          gray[i / 4] = avg;
        }
        return gray;
      }

      // Apply a simple Sobel operator.
      function applySobel(gray, width, height) {
        var G = new Float32Array(width * height);
        var kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        var kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (var y = 1; y < height - 1; y++) {
          for (var x = 1; x < width - 1; x++) {
            var sumX = 0;
            var sumY = 0;
            for (var ky = -1; ky <= 1; ky++) {
              for (var kx = -1; kx <= 1; kx++) {
                var pixel = gray[(y + ky) * width + (x + kx)];
                var kernelIndex = (ky + 1) * 3 + (kx + 1);
                sumX += pixel * kernelX[kernelIndex];
                sumY += pixel * kernelY[kernelIndex];
              }
            }
            var magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
            G[y * width + x] = magnitude;
          }
        }
        return G;
      }

      // Detect a bounding box from the Sobel data.
      function detectBoundingBox(sobelData, width, height, threshold) {
        var minX = width, minY = height;
        var maxX = 0, maxY = 0;
        for (var y = 0; y < height; y++) {
          for (var x = 0; x < width; x++) {
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
          bottomLeft: { x: minX, y: maxY }
        };
      }

      // Main function: load the image, perform edge detection, and draw the bounding box.
      function processImage(imageUrl) {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var gray = grayscale(imageData);
          var sobelData = applySobel(gray, canvas.width, canvas.height);
          var boundingBox = detectBoundingBox(sobelData, canvas.width, canvas.height, 100);
          
          // Draw the bounding box (red rectangle).
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(boundingBox.topLeft.x, boundingBox.topLeft.y);
          ctx.lineTo(boundingBox.topRight.x, boundingBox.topRight.y);
          ctx.lineTo(boundingBox.bottomRight.x, boundingBox.bottomRight.y);
          ctx.lineTo(boundingBox.bottomLeft.x, boundingBox.bottomLeft.y);
          ctx.closePath();
          ctx.stroke();
        };
        img.src = imageUrl;
      }

      // Listen for messages from React Native.
      document.addEventListener("message", function(event) {
        processImage(event.data);
      });
      window.addEventListener("message", function(event) {
        processImage(event.data);
      });
    </script>
  </body>
</html>
`;

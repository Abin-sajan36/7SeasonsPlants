const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/logo.png')
  .pipe(new PNG())
  .on('parsed', function() {
    const width = this.width;
    const height = this.height;

    const isWhiteIsh = (idx) => {
      // Very close to white
      return this.data[idx] > 240 && this.data[idx+1] > 240 && this.data[idx+2] > 240;
    };

    const mask = new Uint8Array(width * height);
    const queue = [];

    const enqueue = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const vIdx = y * width + x;
      if (!mask[vIdx]) {
        const pIdx = vIdx << 2;
        if (isWhiteIsh(pIdx)) {
          mask[vIdx] = 1;
          queue.push({x, y});
        }
      }
    };

    // Start from edges
    for(let x=0; x<width; x++) { enqueue(x, 0); enqueue(x, height-1); }
    for(let y=0; y<height; y++) { enqueue(0, y); enqueue(width-1, y); }

    let head = 0;
    while (head < queue.length) {
      const p = queue[head++];
      enqueue(p.x + 1, p.y);
      enqueue(p.x - 1, p.y);
      enqueue(p.x, p.y + 1);
      enqueue(p.x, p.y - 1);
    }

    // Dilate the mask by 4 pixels to catch anti-aliased edges and shadows
    const dilatedMask = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
         if (mask[y * width + x]) {
             for (let dy = -4; dy <= 4; dy++) {
                 for (let dx = -4; dx <= 4; dx++) {
                     if (dx*dx + dy*dy <= 16) {
                         const nx = x + dx;
                         const ny = y + dy;
                         if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                             dilatedMask[ny * width + nx] = 1;
                         }
                     }
                 }
             }
         }
      }
    }

    // Apply Color to Alpha (White) for pixels in dilatedMask
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const vIdx = y * width + x;
        if (dilatedMask[vIdx]) {
          const idx = vIdx << 2;
          const r = this.data[idx];
          const g = this.data[idx+1];
          const b = this.data[idx+2];
          const a = this.data[idx+3];

          let newA = 255 - Math.min(r, g, b);
          
          if (newA === 0) {
             this.data[idx+3] = 0;
          } else {
             const unblend = (c) => Math.max(0, Math.min(255, Math.round(255 + (c - 255) * 255 / newA)));
             this.data[idx] = unblend(r);
             this.data[idx+1] = unblend(g);
             this.data[idx+2] = unblend(b);
             this.data[idx+3] = Math.min(a, newA);
          }
        }
      }
    }

    // Auto-crop
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let idx = (width * y + x) << 2;
        let alpha = this.data[idx + 3];
        if (alpha > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    const pad = 10;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);
    
    const newWidth = maxX - minX + 1;
    const newHeight = maxY - minY + 1;
    
    const dst = new PNG({ width: newWidth, height: newHeight });
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        let srcIdx = (width * (y + minY) + (x + minX)) << 2;
        let dstIdx = (newWidth * y + x) << 2;
        dst.data[dstIdx] = this.data[srcIdx];
        dst.data[dstIdx+1] = this.data[srcIdx+1];
        dst.data[dstIdx+2] = this.data[srcIdx+2];
        dst.data[dstIdx+3] = this.data[srcIdx+3];
      }
    }

    dst.pack().pipe(fs.createWriteStream('public/logo-flawless2.png'));
    console.log('Successfully processed logo-flawless2.png');
  });

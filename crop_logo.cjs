const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/logo-transparent.png')
  .pipe(new PNG())
  .on('parsed', function() {
    let minX = this.width, minY = this.height, maxX = -1, maxY = -1;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let idx = (this.width * y + x) << 2;
        let alpha = this.data[idx + 3];
        if (alpha > 0) {
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
    maxX = Math.min(this.width - 1, maxX + pad);
    maxY = Math.min(this.height - 1, maxY + pad);
    
    const newWidth = maxX - minX + 1;
    const newHeight = maxY - minY + 1;
    
    const dst = new PNG({ width: newWidth, height: newHeight });
    
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        let srcIdx = (this.width * (y + minY) + (x + minX)) << 2;
        let dstIdx = (newWidth * y + x) << 2;
        dst.data[dstIdx] = this.data[srcIdx];
        dst.data[dstIdx+1] = this.data[srcIdx+1];
        dst.data[dstIdx+2] = this.data[srcIdx+2];
        dst.data[dstIdx+3] = this.data[srcIdx+3];
      }
    }
    
    dst.pack().pipe(fs.createWriteStream('public/logo-flawless.png'));
    console.log('Cropped dimensions: ', newWidth, 'x', newHeight);
  });

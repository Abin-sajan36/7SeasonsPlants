const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/logo.png')
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    const width = this.width;
    const height = this.height;
    
    // We'll consider pixels with R>240, G>240, B>240 as white.
    const isWhite = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return false;
      const idx = (width * y + x) << 2;
      return this.data[idx] > 240 && this.data[idx+1] > 240 && this.data[idx+2] > 240;
    };
    
    const setTransparent = (x, y) => {
      const idx = (width * y + x) << 2;
      this.data[idx+3] = 0; // alpha = 0
    };

    const visited = new Uint8Array(width * height);
    const queue = [];

    const enqueue = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const vIdx = y * width + x;
      if (!visited[vIdx] && isWhite(x, y)) {
        visited[vIdx] = 1;
        queue.push({x, y});
      }
    };

    // Start from corners
    enqueue(0, 0);
    enqueue(width - 1, 0);
    enqueue(0, height - 1);
    enqueue(width - 1, height - 1);
    
    // Also enqueue all edges just in case
    for(let x=0; x<width; x++) { enqueue(x, 0); enqueue(x, height-1); }
    for(let y=0; y<height; y++) { enqueue(0, y); enqueue(width-1, y); }

    let head = 0;
    while (head < queue.length) {
      const p = queue[head++];
      setTransparent(p.x, p.y);
      
      enqueue(p.x + 1, p.y);
      enqueue(p.x - 1, p.y);
      enqueue(p.x, p.y + 1);
      enqueue(p.x, p.y - 1);
    }

    this.pack().pipe(fs.createWriteStream('public/logo-transparent.png'));
    console.log('Successfully created logo-transparent.png');
  });

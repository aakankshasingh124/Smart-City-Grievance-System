// Generate authentic Indian-themed PNG icons using Node built-in zlib
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// CRC32 implementation
function makeCrcTable() {
    let c;
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}
const crcTable = makeCrcTable();

function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
}

function createPng(width, height, pixelFn) {
    // Each row: filter byte 0 followed by 4 bytes per pixel (RGBA)
    const rowSize = 1 + width * 4;
    const rawData = Buffer.alloc(height * rowSize);

    for (let y = 0; y < height; y++) {
        const rowStart = y * rowSize;
        rawData[rowStart] = 0; // Filter: None
        for (let x = 0; x < width; x++) {
            const [r, g, b, a] = pixelFn(x, y, width, height);
            const pxStart = rowStart + 1 + x * 4;
            rawData[pxStart] = r;
            rawData[pxStart + 1] = g;
            rawData[pxStart + 2] = b;
            rawData[pxStart + 3] = a;
        }
    }

    const compressed = zlib.deflateSync(rawData);

    // PNG Signature
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    // IHDR Chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8; // Bit depth: 8
    ihdrData[9] = 6; // Color type: RGBA
    ihdrData[10] = 0; // Compression: Deflate
    ihdrData[11] = 0; // Filter
    ihdrData[12] = 0; // Interlace

    const ihdrChunk = Buffer.alloc(4 + 4 + 13 + 4);
    ihdrChunk.writeUInt32BE(13, 0);
    ihdrChunk.write('IHDR', 4);
    ihdrData.copy(ihdrChunk, 8);
    const ihdrCrc = crc32(ihdrChunk.subarray(4, 21));
    ihdrChunk.writeUInt32BE(ihdrCrc, 21);

    // IDAT Chunk
    const idatChunk = Buffer.alloc(4 + 4 + compressed.length + 4);
    idatChunk.writeUInt32BE(compressed.length, 0);
    idatChunk.write('IDAT', 4);
    compressed.copy(idatChunk, 8);
    const idatCrc = crc32(idatChunk.subarray(4, 8 + compressed.length));
    idatChunk.writeUInt32BE(idatCrc, 8 + compressed.length);

    // IEND Chunk
    const iendChunk = Buffer.alloc(4 + 4 + 0 + 4);
    iendChunk.writeUInt32BE(0, 0);
    iendChunk.write('IEND', 4);
    const iendCrc = crc32(iendChunk.subarray(4, 8));
    iendChunk.writeUInt32BE(iendCrc, 8);

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 1. Generate Favicon PNG (64x64) with Tiranga Circular Seal & Ashoka Chakra
const faviconPng = createPng(64, 64, (x, y, w, h) => {
    const cx = 31.5, cy = 31.5;
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 30) {
        return [0, 0, 0, 0]; // Transparent outside circle
    }

    // Gold outer ring
    if (dist >= 27) {
        return [245, 158, 11, 255]; // Amber gold
    }

    // Tiranga outer ring (dist 20 to 27)
    if (dist >= 20) {
        if (y < 24) return [255, 153, 51, 255]; // Saffron (Kesari)
        if (y > 39) return [19, 136, 8, 255];   // India Green
        return [255, 255, 255, 255];          // White
    }

    // Chakra rim (dist 17 to 20)
    if (dist >= 17) {
        return [11, 37, 69, 255]; // Ashoka Navy Blue
    }

    // Inner White Hub
    if (dist < 5) {
        return [11, 37, 69, 255]; // Navy center dot
    }

    // 24 Ashoka Spokes
    const angle = Math.atan2(dy, dx);
    const spokeCount = 24;
    const spokeAngle = (Math.PI * 2) / spokeCount;
    const normAngle = (angle + Math.PI * 2) % spokeAngle;
    const spokeDiff = Math.abs(normAngle - spokeAngle / 2);

    if (spokeDiff < 0.08) {
        return [11, 37, 69, 255]; // Navy spoke line
    }

    // Base background inside chakra: Ivory / White
    return [255, 255, 255, 255];
});

// 2. Generate Ashoka Emblem Badge PNG (96x96)
const emblemPng = createPng(96, 96, (x, y, w, h) => {
    const cx = 47.5, cy = 47.5;
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 46) return [0, 0, 0, 0];

    // Dual decorative rings
    if (dist >= 43) return [217, 119, 6, 255]; // Warm gold
    if (dist >= 40) return [254, 243, 199, 255]; // Pale cream
    if (dist >= 37) return [11, 37, 69, 255]; // Navy ring

    // Tricolor background bands
    if (y < 35) {
        // Saffron band
        return [255, 153, 51, 255];
    } else if (y > 60) {
        // Green band
        return [19, 136, 8, 255];
    } else {
        // White center band with Ashoka Chakra
        const cdx = x - 47.5, cdy = y - 47.5;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < 14) {
            if (cdist >= 12) return [11, 37, 69, 255];
            if (cdist < 3.5) return [11, 37, 69, 255];
            const cAngle = (Math.atan2(cdy, cdx) + Math.PI * 2) % (Math.PI / 12);
            if (Math.abs(cAngle - Math.PI / 24) < 0.06) {
                return [11, 37, 69, 255]; // Spoke
            }
        }
        return [255, 255, 255, 255];
    }
});

const outDir = path.join(__dirname, '..', 'public', 'images');
fs.writeFileSync(path.join(outDir, 'favicon.png'), faviconPng);
fs.writeFileSync(path.join(outDir, 'ashoka_emblem.png'), emblemPng);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), faviconPng);

console.log('Generated authentic Indian PNG assets:');
console.log(' - public/images/favicon.png (64x64)');
console.log(' - public/images/ashoka_emblem.png (96x96)');
console.log(' - public/favicon.ico');

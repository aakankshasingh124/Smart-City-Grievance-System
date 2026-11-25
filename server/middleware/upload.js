// File Upload & Image Validation Middleware
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_MIME_TYPES = [
    'audio/webm',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',
    'audio/mp4',
    'audio/mpeg',
    'audio/mp3',
    'audio/aac',
    'audio/x-m4a'
];

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function saveBase64Image(base64Data, originalName = 'upload.jpg') {
    if (!base64Data) return null;

    let mimeType = 'image/jpeg';
    let rawBase64 = base64Data;

    if (base64Data.startsWith('data:')) {
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 image data');
        }
        mimeType = matches[1].toLowerCase();
        rawBase64 = matches[2];
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not supported. Allowed: JPEG, PNG, WebP.`);
    }

    const buffer = Buffer.from(rawBase64, 'base64');
    if (buffer.length > MAX_FILE_SIZE) {
        throw new Error(`Image size exceeds 5MB limit (${(buffer.length / 1024 / 1024).toFixed(2)}MB).`);
    }

    // Validate image magic bytes
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isWebp = buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP';

    if (!isJpeg && !isPng && !isWebp) {
        throw new Error('File content does not match genuine image signature.');
    }

    let ext = '.jpg';
    if (isPng) ext = '.png';
    else if (isWebp) ext = '.webp';

    const safeName = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const fullPath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(fullPath, buffer);

    return {
        filePath: `/uploads/${safeName}`,
        fileName: safeName,
        fileSize: buffer.length,
        mimeType
    };
}

function saveBase64Audio(base64Data, originalName = 'voice.webm') {
    if (!base64Data) return null;

    let mimeType = 'audio/webm';
    let rawBase64 = base64Data;

    if (base64Data.startsWith('data:')) {
        const base64Index = base64Data.indexOf(';base64,');
        if (base64Index === -1) {
            throw new Error('Invalid base64 audio data');
        }
        mimeType = base64Data.substring(5, base64Index).toLowerCase().split(';')[0].trim();
        rawBase64 = base64Data.substring(base64Index + 8);
    }

    const buffer = Buffer.from(rawBase64, 'base64');
    if (buffer.length > MAX_AUDIO_SIZE) {
        throw new Error(`Audio recording exceeds 15MB limit (${(buffer.length / 1024 / 1024).toFixed(2)}MB).`);
    }

    let ext = '.webm';
    if (mimeType.includes('wav')) ext = '.wav';
    else if (mimeType.includes('ogg')) ext = '.ogg';
    else if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = '.m4a';
    else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) ext = '.mp3';
    else if (mimeType.includes('aac')) ext = '.aac';

    const safeName = `voice_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const fullPath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(fullPath, buffer);

    return {
        filePath: `/uploads/${safeName}`,
        fileName: safeName,
        fileSize: buffer.length,
        mimeType
    };
}

module.exports = {
    saveBase64Image,
    saveBase64Audio,
    MAX_FILE_SIZE,
    MAX_AUDIO_SIZE,
    ALLOWED_MIME_TYPES,
    ALLOWED_AUDIO_MIME_TYPES
};

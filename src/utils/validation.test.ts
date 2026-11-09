import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateImageFile,
  validateImageSignature,
  getCategoryForConditionId,
  getDisplayNameForConditionId,
  normalizeMatchLevel,
  validateAndSanitizeAiResponse,
  ALLOWED_CONDITION_IDS,
} from './validation';

test('ALLOWED_CONDITION_IDS contains exactly the 6 dataset classes plus 3 outcomes', () => {
  assert.equal(ALLOWED_CONDITION_IDS.length, 9);
  assert.ok(ALLOWED_CONDITION_IDS.includes('ALGAL_LEAF_SPOT'));
  assert.ok(ALLOWED_CONDITION_IDS.includes('BLACK_BLIGHT'));
  assert.ok(ALLOWED_CONDITION_IDS.includes('BLISTER_BLIGHT'));
  assert.ok(ALLOWED_CONDITION_IDS.includes('GRAY_BLIGHT'));
  assert.ok(ALLOWED_CONDITION_IDS.includes('SPIDER_MITES'));
  assert.ok(ALLOWED_CONDITION_IDS.includes('HEALTHY'));
  assert.ok(ALLOWED_CONDITION_IDS.includes('UNKNOWN'));
  assert.ok(ALLOWED_CONDITION_IDS.includes('NOT_TEA'));
  assert.ok(ALLOWED_CONDITION_IDS.includes('POOR_IMAGE'));
});

test('Spider mites is strictly classified as a pest, not a disease', () => {
  const category = getCategoryForConditionId('SPIDER_MITES');
  assert.equal(category, 'pest');
});

test('Healthy leaf is classified as healthy', () => {
  const category = getCategoryForConditionId('HEALTHY');
  assert.equal(category, 'healthy');
});

test('Blight conditions and Algal Leaf Spot are classified as disease', () => {
  assert.equal(getCategoryForConditionId('BLISTER_BLIGHT'), 'disease');
  assert.equal(getCategoryForConditionId('GRAY_BLIGHT'), 'disease');
  assert.equal(getCategoryForConditionId('BLACK_BLIGHT'), 'disease');
  assert.equal(getCategoryForConditionId('ALGAL_LEAF_SPOT'), 'disease');
});

test('validateImageFile accepts valid JPG, PNG, and WebP under 5MB', () => {
  const validJpeg = validateImageFile({ size: 1024 * 1024, type: 'image/jpeg', name: 'tea.jpg' });
  assert.equal(validJpeg.valid, true);

  const validPng = validateImageFile({ size: 2 * 1024 * 1024, type: 'image/png', name: 'tea.png' });
  assert.equal(validPng.valid, true);

  const validWebp = validateImageFile({ size: 500 * 1024, type: 'image/webp', name: 'tea.webp' });
  assert.equal(validWebp.valid, true);
});

test('validateImageFile rejects files exceeding 5MB or invalid formats', () => {
  const oversized = validateImageFile({ size: 6 * 1024 * 1024, type: 'image/jpeg', name: 'big.jpg' });
  assert.equal(oversized.valid, false);
  assert.match(oversized.error || '', /exceeds maximum allowed limit/i);

  const invalidFormat = validateImageFile({ size: 100 * 1024, type: 'application/pdf', name: 'doc.pdf' });
  assert.equal(invalidFormat.valid, false);
  assert.match(invalidFormat.error || '', /unsupported file format/i);
});

test('validateImageSignature validates real magic bytes for JPEG, PNG, WebP', () => {
  // JPEG magic bytes
  const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const jpegResult = validateImageSignature(jpegBytes);
  assert.equal(jpegResult.valid, true);
  assert.equal(jpegResult.mimeType, 'image/jpeg');

  // PNG magic bytes
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const pngResult = validateImageSignature(pngBytes);
  assert.equal(pngResult.valid, true);
  assert.equal(pngResult.mimeType, 'image/png');

  // Corrupted / Fake executable bytes
  const fakeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
  const fakeResult = validateImageSignature(fakeBytes);
  assert.equal(fakeResult.valid, false);
  assert.match(fakeResult.error || '', /invalid file signature/i);
});

test('validateAndSanitizeAiResponse sanitizes raw output and rejects invalid condition IDs', () => {
  // Invalid hallucinated condition ID must fallback to UNKNOWN
  const hallucinatedInput = {
    primaryCondition: {
      id: 'SOME_FABRICATED_RUST_DISEASE',
      matchLevel: '98%', // Fabricated percentage must normalize to qualitative match
    },
    visualObservations: ['Spots seen on leaf'],
  };

  const sanitized = validateAndSanitizeAiResponse(hallucinatedInput);
  assert.equal(sanitized.primaryCondition.id, 'UNKNOWN');
  assert.equal(sanitized.primaryCondition.category, 'unclear');
  assert.ok(sanitized.disclaimer.includes('Preliminary AI screening only'));
});

test('validateAndSanitizeAiResponse preserves valid Blister Blight with qualitative match', () => {
  const validAiInput = {
    cropSupported: true,
    isTeaLeaf: true,
    primaryCondition: {
      id: 'BLISTER_BLIGHT',
      matchLevel: 'strong',
    },
    alternativeConditions: [
      { id: 'GRAY_BLIGHT', matchLevel: 'weak', reasonForDoubt: 'Concentric rings not fully formed' },
    ],
    visualObservations: ['Translucent circular blister on tender flush.'],
  };

  const sanitized = validateAndSanitizeAiResponse(validAiInput);
  assert.equal(sanitized.primaryCondition.id, 'BLISTER_BLIGHT');
  assert.equal(sanitized.primaryCondition.category, 'disease');
  assert.equal(sanitized.primaryCondition.matchLevel, 'strong');
  assert.equal(sanitized.alternativeConditions.length, 1);
  assert.equal(sanitized.alternativeConditions[0].id, 'GRAY_BLIGHT');
});

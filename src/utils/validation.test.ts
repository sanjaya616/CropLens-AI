import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateImageFile,
  validateImageSignature,
  getCategoryForConditionId,
  getDisplayNameForConditionId,
  normalizeMatchLevel,
  validateAndSanitizeAiResponse,
  validateConsentPayload,
  ALLOWED_CONDITION_IDS,
} from './validation';
import { isAdministrator } from '../../server/middleware/auth';

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

test('validateAndSanitizeAiResponse returns truthful non-fabricating fallback when raw input is null or invalid', () => {
  const nullResult = validateAndSanitizeAiResponse(null);
  assert.equal(nullResult.cropSupported, false);
  assert.equal(nullResult.isTeaLeaf, false);
  assert.equal(nullResult.imageQuality, 'poor');
  assert.equal(nullResult.primaryCondition.id, 'UNKNOWN');
  assert.equal(nullResult.photoQuality.usable, false);
  assert.equal(nullResult.photoQuality.retakeRecommended, true);

  const stringResult = validateAndSanitizeAiResponse('invalid string output');
  assert.equal(stringResult.cropSupported, false);
  assert.equal(stringResult.isTeaLeaf, false);
  assert.equal(stringResult.imageQuality, 'poor');
});

test('validateConsentPayload enforces explicit consent confirmation and notice version', () => {
  // Missing consentConfirmed
  const missingConsent = validateConsentPayload({});
  assert.equal(missingConsent.valid, false);
  assert.match(missingConsent.error || '', /consent is required/i);

  // False consent
  const falseConsent = validateConsentPayload({ consentConfirmed: false, consentNoticeVersion: '1.0' });
  assert.equal(falseConsent.valid, false);

  // Missing version
  const missingVersion = validateConsentPayload({ consentConfirmed: true });
  assert.equal(missingVersion.valid, false);
  assert.match(missingVersion.error || '', /consentNoticeVersion/i);

  // Valid boolean consent
  const validBool = validateConsentPayload({ consentConfirmed: true, consentNoticeVersion: '1.0' });
  assert.equal(validBool.valid, true);

  // Valid string consent (multipart form data)
  const validStr = validateConsentPayload({ consentConfirmed: 'true', consentNoticeVersion: '1.0' });
  assert.equal(validStr.valid, true);
});

test('normalizeMatchLevel correctly parses qualitative levels and rejects numerical percentages', () => {
  assert.equal(normalizeMatchLevel('strong'), 'strong');
  assert.equal(normalizeMatchLevel('Strong visual similarity'), 'strong');
  assert.equal(normalizeMatchLevel('possible'), 'possible');
  assert.equal(normalizeMatchLevel('weak'), 'weak');
  assert.equal(normalizeMatchLevel('insufficient'), 'insufficient');
  // Unknown or percentage strings fall back cleanly
  assert.equal(normalizeMatchLevel('98% probability'), 'possible');
  assert.equal(normalizeMatchLevel(null), 'possible');
});

test('isAdministrator strictly checks custom claims and server allowlist, never trusting client role', () => {
  // 1. Token with custom claim admin === true

  // 1. Token with custom claim admin === true
  assert.equal(isAdministrator('user-123', { admin: true }), true);

  // 2. Token with admin === false and not in allowlist
  assert.equal(isAdministrator('user-123', { admin: false }), false);

  // 3. Regular farmer UID without admin claims
  assert.equal(isAdministrator('farmer-999', {}), false);

  // 4. Empty or undefined UID
  assert.equal(isAdministrator('', { admin: true }), false);
});


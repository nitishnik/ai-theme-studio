import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presets } from '../shared/presets';
import { themeSchema, contrast, generationSchema } from '../shared/theme';
import { exportTheme, exportFormats } from '../shared/export';
test('all presets validate and use independent modes', () => {
  for (const t of presets) {
    assert.ok(themeSchema.safeParse(t).success);
    assert.notDeepEqual(t.light, t.dark);
  }
});
test('rejects malformed tokens and injected style values', () => {
  assert.equal(themeSchema.safeParse({ ...presets[0], radius: '1rem; color:red' }).success, false);
  assert.equal(
    themeSchema.safeParse({ ...presets[0], light: { ...presets[0].light, primary: 'red' } })
      .success,
    false,
  );
});
test('WCAG reference ratios', () => {
  assert.equal(contrast('#000000', '#ffffff'), 21);
  assert.equal(contrast('#ffffff', '#ffffff'), 1);
});
test('generation requires exactly three complete themes', () => {
  assert.equal(generationSchema.safeParse({ themes: [presets[0]] }).success, false);
  assert.ok(generationSchema.safeParse({ themes: presets.slice(0, 3) }).success);
});
test('all export formats include usable configuration', () => {
  for (const format of exportFormats) assert.ok(exportTheme(presets[0], format).length > 100);
  assert.deepEqual(JSON.parse(exportTheme(presets[0], 'JSON tokens')), presets[0]);
});

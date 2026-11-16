import { describe, it, expect } from 'vitest';
import { parseSalesPage, validateSalesPage } from './salesPage';
import { pickText } from '@/i18n/lang';

describe('parseSalesPage', () => {
  it('keeps valid sections and drops invalid ones without throwing', () => {
    const page = parseSalesPage({
      batch: { name: { en: 'Batch 14', bn: 'ব্যাচ ১৪' }, seats_left: 12 },
      projects: [{ title: 'RAG app' }],
      community: { members: 'lots' }, // invalid: url missing, members not a number
      unknown_section: { x: 1 },
    });
    expect(page.batch?.seats_left).toBe(12);
    expect(page.projects).toHaveLength(1);
    expect(page.community).toBeUndefined();
    expect(page).not.toHaveProperty('unknown_section');
  });

  it('rejects script/data URLs anywhere they become href/src', () => {
    const page = parseSalesPage({
      community: { url: 'javascript:alert(1)' },
      projects: [{ title: 'x', link: 'data:text/html,hi' }],
      certificate: { image_url: '//evil.example/x.png', points: [] },
      demo_classes: { videos: [{ title: 'ok', video_url: 'https://youtu.be/abcdefghijk' }] },
    });
    expect(page.community).toBeUndefined();
    expect(page.projects).toBeUndefined();
    expect(page.certificate).toBeUndefined();
    expect(page.demo_classes?.videos).toHaveLength(1);
  });

  it('treats null / arrays / garbage as empty', () => {
    expect(parseSalesPage(null)).toEqual({});
    expect(parseSalesPage([1, 2])).toEqual({});
    expect(parseSalesPage('x')).toEqual({});
  });

  it('validateSalesPage reports the failing section for the admin save path', () => {
    const result = validateSalesPage({ community: { members: -1 } });
    expect(result.ok).toBe(false);
    expect((result as { errors: string[] }).errors[0]).toMatch(/^community:/);
  });
});

describe('pickText', () => {
  it('falls back to English, then Bangla, then plain string', () => {
    expect(pickText({ en: 'Hi', bn: 'হাই' }, 'bn')).toBe('হাই');
    expect(pickText({ en: 'Hi' }, 'bn')).toBe('Hi');
    expect(pickText({ bn: 'হাই' }, 'en')).toBe('হাই');
    expect(pickText('plain', 'bn')).toBe('plain');
    expect(pickText(undefined, 'en')).toBe('');
  });
});

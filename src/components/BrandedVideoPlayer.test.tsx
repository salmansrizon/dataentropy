import { describe, it, expect, vi, beforeAll } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setLang } from '@/i18n/lang';
import BrandedVideoPlayer from './BrandedVideoPlayer';
import { youTubeId } from '@/lib/youtube';

beforeAll(() => setLang('en'));

// Fake YouTube IFrame API: records calls, lets the test drive player state.
const calls: string[] = [];
let events: { onReady?: (e: unknown) => void; onStateChange?: (e: { data: number }) => void } = {};
let opts: { playerVars?: Record<string, number>; host?: string } = {};
class FakePlayer {
  constructor(_el: HTMLElement, o: { events: typeof events; playerVars: Record<string, number>; host: string }) { events = o.events; opts = o; }
  playVideo() { calls.push('play'); } pauseVideo() { calls.push('pause'); } seekTo() { calls.push('seek'); }
  mute() { calls.push('mute'); } unMute() { calls.push('unmute'); } getCurrentTime() { return 12; } getDuration() { return 300; }
  setPlaybackRate(r: number) { calls.push('rate:' + r); } destroy() {}
}
vi.stubGlobal('YT', { Player: FakePlayer });

describe('BrandedVideoPlayer', () => {
  it('shows our poster + play button and loads nothing from YouTube before the learner presses play', () => {
    render(<BrandedVideoPlayer videoId="-Nlt6OJQcAs" title="Intro" />);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('hides YouTube chrome: own controls only, click shield drives play/pause, cover returns on pause', async () => {
    render(<BrandedVideoPlayer videoId="-Nlt6OJQcAs" title="Intro" />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Play' })[0]);
    await act(async () => { await Promise.resolve(); });
    // YouTube's own controls, keyboard, fullscreen and related videos are all disabled; privacy host used
    expect(opts.playerVars).toMatchObject({ controls: 0, disablekb: 1, fs: 0, rel: 0, iv_load_policy: 3 });
    expect(opts.host).toBe('https://www.youtube-nocookie.com');

    act(() => { events.onReady?.({ target: new FakePlayer(document.body, { events, playerVars: {}, host: '' }) }); events.onStateChange?.({ data: 1 }); });
    expect(screen.getByRole('slider', { name: 'Seek' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Full screen' })).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: 'Pause' })[0]); // shield click
    expect(calls).toContain('pause');
    act(() => { events.onStateChange?.({ data: 2 }); });
    // paused: our play cover is back over the video (hides YouTube's paused title bar)
    expect(screen.getAllByRole('button', { name: 'Play' }).length).toBeGreaterThan(0);

    act(() => { events.onStateChange?.({ data: 0 }); }); // ended: our replay cover, not YouTube suggestions
    expect(screen.getByRole('button', { name: 'Replay' })).toBeInTheDocument();
  });

  it('parses youtu.be, watch, embed and shorts URLs', () => {
    expect(youTubeId('https://youtu.be/-Nlt6OJQcAs')).toBe('-Nlt6OJQcAs');
    expect(youTubeId('https://www.youtube.com/watch?v=-Nlt6OJQcAs&t=4')).toBe('-Nlt6OJQcAs');
    expect(youTubeId('https://www.youtube.com/embed/-Nlt6OJQcAs')).toBe('-Nlt6OJQcAs');
    expect(youTubeId('https://youtube.com/shorts/-Nlt6OJQcAs')).toBe('-Nlt6OJQcAs');
    expect(youTubeId('https://vimeo.com/1')).toBeNull();
  });
});

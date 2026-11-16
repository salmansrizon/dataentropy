import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";

/**
 * Site-branded YouTube player: YouTube IFrame API with its own controls off, a click shield over
 * the iframe (no YouTube title/logo/links reachable), our own controls, and our own overlay while
 * paused / ended (covers YouTube's pause title bar and end-screen suggestions).
 * ponytail: YouTube API terms ask players not to obscure YouTube branding — owner's call to ship.
 */

const T = {
  en: { play: "Play", pause: "Pause", mute: "Mute", unmute: "Unmute", full: "Full screen", exitFull: "Exit full screen", seek: "Seek", speed: "Playback speed", replay: "Replay", player: "Video player" },
  bn: { play: "চালান", pause: "থামান", mute: "শব্দ বন্ধ", unmute: "শব্দ চালু", full: "ফুল স্ক্রিন", exitFull: "ফুল স্ক্রিন বন্ধ", seek: "ভিডিওর অবস্থান", speed: "প্লেব্যাক স্পিড", replay: "আবার দেখুন", player: "ভিডিও প্লেয়ার" },
};

// Minimal typing for the bits of the YT IFrame API we use.
interface YTPlayer {
  playVideo(): void; pauseVideo(): void; seekTo(s: number, allow: boolean): void;
  mute(): void; unMute(): void; getCurrentTime(): number; getDuration(): number;
  setPlaybackRate(r: number): void; destroy(): void;
}
declare global {
  interface Window { YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer }; onYouTubeIframeAPIReady?: () => void }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}


const fmt = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? h + ":" : ""}${mm}:${String(sec).padStart(2, "0")}`;
};
const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function BrandedVideoPlayer({ videoId, title, poster, autoPlay = false }: { videoId: string; title: string; poster?: string; autoPlay?: boolean }) {
  const t = useT(T);
  const { num } = useLang();
  const wrap = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [started, setStarted] = useState(autoPlay);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isFull, setIsFull] = useState(false);

  // Create the YouTube player only after the learner presses play (no YouTube load before intent).
  useEffect(() => {
    if (!started || !mount.current) return;
    let cancelled = false;
    void loadYouTubeApi().then(() => {
      if (cancelled || !mount.current || !window.YT) return;
      player.current = new window.YT.Player(mount.current, {
        host: "https://www.youtube-nocookie.com",
        videoId,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, cc_load_policy: 0 },
        events: {
          onReady: (e: { target: YTPlayer }) => { setReady(true); setDuration(e.target.getDuration()); e.target.playVideo(); },
          onStateChange: (e: { data: number }) => {
            // 0 ended, 1 playing, 2 paused
            setPlaying(e.data === 1);
            setEnded(e.data === 0);
            if (e.data === 1) setDuration(player.current?.getDuration() ?? 0);
          },
        },
      });
    });
    return () => { cancelled = true; player.current?.destroy(); player.current = null; };
  }, [started, videoId]);

  // Progress ticker only while playing.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setTime(player.current?.getCurrentTime() ?? 0), 250);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    const onFs = () => setIsFull(document.fullscreenElement === wrap.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggle = useCallback(() => {
    if (!started) return setStarted(true);
    const p = player.current; if (!p) return;
    if (ended) { p.seekTo(0, true); p.playVideo(); return; }
    if (playing) p.pauseVideo(); else p.playVideo();
  }, [started, ended, playing]);

  const seek = (s: number) => { player.current?.seekTo(s, true); setTime(s); };
  const toggleMute = () => { const p = player.current; if (!p) return; if (muted) p.unMute(); else p.mute(); setMuted(!muted); };
  const cycleSpeed = () => { const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; player.current?.setPlaybackRate(next); setSpeed(next); };
  const toggleFull = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void wrap.current?.requestFullscreen?.(); };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === " " || e.key.toLowerCase() === "k") { e.preventDefault(); toggle(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); seek(Math.min(duration, time + 5)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); seek(Math.max(0, time - 5)); }
    else if (e.key.toLowerCase() === "m") toggleMute();
    else if (e.key.toLowerCase() === "f") toggleFull();
  };

  const loc = (s: string) => s.replace(/\d/g, (d) => num(Number(d))); // Bangla digits when lang=bn
  const thumb = poster ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const showCover = !started || !ready || !playing; // our overlay hides YouTube's paused/ended chrome

  return (
    <div
      ref={wrap}
      role="region"
      aria-label={`${t.player}: ${title}`}
      tabIndex={0}
      onKeyDown={onKey}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-scrim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* YouTube iframe mounts here; scaled slightly so its edge chrome sits outside the frame */}
      {started && <div className="pointer-events-none absolute inset-0 scale-[1.02]"><div ref={mount} className="h-full w-full" /></div>}

      {/* Click shield: every click hits our UI, never YouTube's */}
      <button type="button" aria-label={playing ? t.pause : t.play} onClick={toggle} className="absolute inset-0 z-10 h-full w-full cursor-pointer bg-transparent" />

      {/* Cover while not playing: poster before start, dim veil when paused, replay when ended */}
      {showCover && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-scrim/70 via-scrim/20 to-scrim/40" />
          <span className="relative grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-pop transition-transform group-hover:scale-105">
            {ended ? <RotateCcw className="h-7 w-7" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
          </span>
        </div>
      )}

      {/* Our control bar */}
      {started && ready && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 bg-gradient-to-t from-scrim/80 to-transparent px-3 pb-2 pt-8 text-primary-foreground opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button type="button" onClick={toggle} aria-label={ended ? t.replay : playing ? t.pause : t.play} className="grid h-9 w-9 place-items-center rounded-full hover:bg-primary-foreground/15">
            {ended ? <RotateCcw className="h-4 w-4" /> : playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
          <span className="shrink-0 text-xs tabular-nums">{loc(fmt(time))} / {loc(fmt(duration))}</span>
          <input
            type="range" min={0} max={duration || 0} step={1} value={Math.min(time, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label={t.seek}
            className="h-1 flex-1 cursor-pointer accent-[hsl(var(--primary))]"
          />
          <button type="button" onClick={cycleSpeed} aria-label={t.speed} className="h-9 min-w-9 rounded-full px-2 text-xs font-semibold hover:bg-primary-foreground/15">{speed}x</button>
          <button type="button" onClick={toggleMute} aria-label={muted ? t.unmute : t.mute} className="grid h-9 w-9 place-items-center rounded-full hover:bg-primary-foreground/15">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button type="button" onClick={toggleFull} aria-label={isFull ? t.exitFull : t.full} className="grid h-9 w-9 place-items-center rounded-full hover:bg-primary-foreground/15">
            {isFull ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

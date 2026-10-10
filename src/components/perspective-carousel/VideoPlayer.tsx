import { HugeiconsIcon } from "@hugeicons/react";
import {
  FullScreenIcon,
  GoBackward10SecIcon,
  GoForward10SecIcon,
  MinimizeScreenIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeMute01Icon,
} from "@hugeicons/core-free-icons";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { CSSProperties, VideoHTMLAttributes } from "react";

interface VideoPlayerProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "controls"> {
  controls?: boolean;
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(function VideoPlayer(
  {
    autoPlay,
    className,
    controls = true,
    muted = false,
    onEnded,
    onLoadedMetadata,
    onPause,
    onPlay,
    onTimeUpdate,
    onVolumeChange,
    src,
    ...props
  },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  useImperativeHandle(forwardedRef, () => videoRef.current as HTMLVideoElement, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  const queueControlsHide = useCallback(() => {
    clearHideTimer();
    if (!videoRef.current?.paused) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 2600);
    }
  }, [clearHideTimer]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    queueControlsHide();
  }, [queueControlsHide]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    setCurrentTime(video.currentTime);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) void containerRef.current?.requestFullscreen();
    else void document.exitFullscreen();
  }, []);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setControlsVisible(true);
  }, [src]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => clearHideTimer, [clearHideTimer]);

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volumeProgress = (isMuted ? 0 : volume) * 100;
  const playerStyle = { "--pc-video-progress": `${progress}%` } as CSSProperties;
  const volumeStyle = { "--pc-video-volume": `${volumeProgress}%` } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`pc-video-player${isPlaying ? " is-playing" : ""}${controlsVisible ? " is-controls-visible" : ""}${className ? ` ${className}` : ""}`}
      style={playerStyle}
      tabIndex={0}
      onPointerMove={revealControls}
      onPointerLeave={() => { if (isPlaying) setControlsVisible(false); }}
      onFocus={revealControls}
      onKeyDown={(event) => {
        if ([" ", "k", "m", "f", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
        }
        if (event.key === " " || event.key === "k") togglePlay();
        if (event.key === "m") toggleMute();
        if (event.key === "f") toggleFullscreen();
        if (event.key === "ArrowLeft") skip(-10);
        if (event.key === "ArrowRight") skip(10);
      }}
    >
      <video
        {...props}
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        controls={false}
        onClick={togglePlay}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          setVolume(event.currentTarget.volume);
          setIsMuted(event.currentTarget.muted);
          onLoadedMetadata?.(event);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
          onTimeUpdate?.(event);
        }}
        onPlay={(event) => {
          setIsPlaying(true);
          queueControlsHide();
          onPlay?.(event);
        }}
        onPause={(event) => {
          setIsPlaying(false);
          setControlsVisible(true);
          clearHideTimer();
          onPause?.(event);
        }}
        onEnded={(event) => {
          setIsPlaying(false);
          setControlsVisible(true);
          onEnded?.(event);
        }}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setIsMuted(event.currentTarget.muted);
          onVolumeChange?.(event);
        }}
      />

      {controls ? (
        <>
          <div className="pc-video-player__center" aria-hidden={!controlsVisible && isPlaying}>
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? "Pause video" : "Play video"}>
              <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} size={28} strokeWidth={1.8} />
            </button>
          </div>
          <div className="pc-video-player__controls">
            <div className="pc-video-player__timeline">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step="any"
                value={Math.min(currentTime, duration || 0)}
                aria-label="Video progress"
                onChange={(event) => {
                  const nextTime = Number(event.target.value);
                  if (videoRef.current) videoRef.current.currentTime = nextTime;
                  setCurrentTime(nextTime);
                }}
              />
              <span>{formatTime(duration)}</span>
            </div>
            <div className="pc-video-player__actions">
              <div>
                <button type="button" onClick={() => skip(-10)} aria-label="Back 10 seconds">
                  <HugeiconsIcon icon={GoBackward10SecIcon} size={19} strokeWidth={1.8} />
                </button>
                <button type="button" onClick={togglePlay} aria-label={isPlaying ? "Pause video" : "Play video"}>
                  <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} size={19} strokeWidth={1.8} />
                </button>
                <button type="button" onClick={() => skip(10)} aria-label="Forward 10 seconds">
                  <HugeiconsIcon icon={GoForward10SecIcon} size={19} strokeWidth={1.8} />
                </button>
                <div className="pc-video-player__volume" style={volumeStyle}>
                  <button type="button" onClick={toggleMute} aria-label={isMuted ? "Unmute video" : "Mute video"}>
                    <HugeiconsIcon icon={isMuted || volume === 0 ? VolumeMute01Icon : VolumeHighIcon} size={19} strokeWidth={1.8} />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    aria-label="Video volume"
                    onChange={(event) => {
                      const nextVolume = Number(event.target.value);
                      if (!videoRef.current) return;
                      videoRef.current.volume = nextVolume;
                      videoRef.current.muted = nextVolume === 0;
                    }}
                  />
                </div>
              </div>
              <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                <HugeiconsIcon icon={isFullscreen ? MinimizeScreenIcon : FullScreenIcon} size={19} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
});

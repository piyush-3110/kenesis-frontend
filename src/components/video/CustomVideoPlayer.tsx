'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Settings,
  Download,
  RotateCcw,
  FileText,
  File,
  ExternalLink
} from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  className?: string;
  documents?: DocumentAttachment[];
}

interface DocumentAttachment {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'txt' | 'other';
  size?: string;
}

interface PlaybackSpeed {
  value: number;
  label: string;
}

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [
  { value: 0.25, label: '0.25x' },
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: 'Normal' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 1.75, label: '1.75x' },
  { value: 2, label: '2x' },
];

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  title,
  poster,
  autoPlay = false,
  onProgress,
  onEnded,
  className = '',
  documents = [],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [bufferedRanges, setBufferedRanges] = useState<TimeRanges | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);

  // Custom progress update for speed-synchronized updates
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Speed-synchronized progress updates
  useEffect(() => {
    if (!videoRef.current) return;

    // Clear existing interval
    if (progressUpdateRef.current) {
      clearInterval(progressUpdateRef.current);
    }

    // Always update progress, regardless of play state for better sync
    const updateInterval = Math.max(50, 200 / playbackSpeed);

    progressUpdateRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.duration) {
        const currentVideoTime = videoRef.current.currentTime;
        const videoDuration = videoRef.current.duration;
        
        // Update both time and progress together for perfect sync
        setCurrentTime(currentVideoTime);
        setBufferedRanges(videoRef.current.buffered);
        
        if (onProgress) {
          const progress = (currentVideoTime / videoDuration) * 100;
          onProgress(progress);
        }
      }
    }, updateInterval);

    return () => {
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
      }
    };
  }, [playbackSpeed, onProgress]); // Removed isPlaying dependency

  // Cleanup progress interval when component unmounts
  useEffect(() => {
    return () => {
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
      }
    };
  }, []);

  // Hide controls timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Document helper functions
  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  // Format time helper
  const formatTime = (time: number): string => {
    if (!time || !isFinite(time)) return '0:00';
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset controls timer
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying]);

  // Seek functionality with immediate UI update
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    // Update video time
    videoRef.current.currentTime = newTime;
    
    // Immediately update UI for responsive feedback
    setCurrentTime(newTime);
    
    if (onProgress) {
      const progress = (newTime / duration) * 100;
      onProgress(progress);
    }
  };

  // Skip forward/backward with immediate UI update
  const skipForward = useCallback(() => {
    if (!videoRef.current) return;
    const newTime = Math.min(videoRef.current.currentTime + 10, duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime); // Immediate UI update
  }, [duration]);

  const skipBackward = useCallback(() => {
    if (!videoRef.current) return;
    const newTime = Math.max(videoRef.current.currentTime - 10, 0);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime); // Immediate UI update
  }, []);

  // Volume control - horizontal slider
  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current || !videoRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newVolume = Math.max(0, Math.min(1, percentage));

    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  // Mute/Unmute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Change playback speed with smooth progress updates
  const changePlaybackSpeed = (speed: number) => {
    if (!videoRef.current) return;
    
    // Don't show loading state for speed changes - video continues playing
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
    
    console.log(`Playback speed changed to: ${speed}x`);
  };

  // Video source change handler - Fix for video switching issue
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset player state when source changes
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBufferedRanges(null);

    // Load new video source
    if (video.src !== src) {
      video.src = src;
      video.load(); // Force reload of the video
    }

    // Reset playback speed
    video.playbackRate = playbackSpeed;
  }, [src, playbackSpeed]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      // Use native timeupdate as backup for paused state only
      if (!videoRef.current || isPlaying) return;
      
      setCurrentTime(video.currentTime);
      setBufferedRanges(video.buffered);
      if (onProgress && video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    const handleError = (e: Event) => {
      console.error('Video loading error:', e);
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [onProgress, onEnded]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => {
            const newVolume = Math.min(1, prev + 0.1);
            if (videoRef.current) videoRef.current.volume = newVolume;
            return newVolume;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => {
            const newVolume = Math.max(0, prev - 0.1);
            if (videoRef.current) videoRef.current.volume = newVolume;
            return newVolume;
          });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayPause, skipBackward, skipForward, toggleMute, toggleFullscreen]);

  // Mouse move handler for showing controls
  const handleMouseMove = () => {
    resetControlsTimer();
  };

  // Mouse leave handler
  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        onClick={togglePlayPause}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4 text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4 text-white font-semibold text-lg">
            {title}
          </div>
        )}

        {/* Settings Panel - Better positioned */}
        {showSettings && (
          <div className="absolute bottom-20 right-4 bg-black/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 min-w-[240px] z-50">
            <div className="p-4">
              {/* Speed Settings */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Playback Speed
                </h4>
                <div className="space-y-1">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed.value}
                      onClick={() => changePlaybackSpeed(speed.value)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-between ${
                        playbackSpeed === speed.value
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span>{speed.label}</span>
                      {playbackSpeed === speed.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Panel */}
        {showDocuments && documents && documents.length > 0 && (
          <div className="absolute bottom-20 left-4 bg-black/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 min-w-[300px] max-w-[400px] z-50">
            <div className="p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Attached Documents ({documents.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                    onClick={() => openDocument(doc.url)}
                  >
                    {getDocumentIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {doc.title}
                      </div>
                      <div className="text-gray-400 text-xs flex items-center gap-2">
                        <span>{doc.type.toUpperCase()}</span>
                        {doc.size && (
                          <>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-400 text-center">
                Click any document to open in new tab
              </div>
            </div>
          </div>
        )}

        {/* Center Play Button */}
        {!isPlaying && !isLoading && (
          <button
            onClick={togglePlayPause}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors"
          >
            <Play size={48} className="text-white ml-1" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-4 group relative"
            onClick={handleSeek}
          >
            {/* Buffered Progress */}
            {bufferedRanges && duration > 0 && (
              <div className="absolute inset-0">
                {Array.from({ length: bufferedRanges.length }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-full bg-gray-400 rounded-full opacity-30"
                    style={{
                      left: `${(bufferedRanges.start(i) / duration) * 100}%`,
                      width: `${((bufferedRanges.end(i) - bufferedRanges.start(i)) / duration) * 100}%`
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Current Progress */}
            <div
              className="h-full bg-blue-500 rounded-full relative transition-all duration-150"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Skip Backward */}
              <button
                onClick={skipBackward}
                className="text-white hover:text-blue-400 transition-colors"
                title="Skip backward 10s"
              >
                <SkipBack size={24} />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="text-white hover:text-blue-400 transition-colors"
                title="Skip forward 10s"
              >
                <SkipForward size={24} />
              </button>

              {/* Volume Controls - Horizontal */}
              <div className="flex items-center space-x-2 relative group">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>

                {/* Horizontal Volume Slider */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                  <div
                    ref={volumeRef}
                    className="w-20 h-2 bg-gray-600 rounded-full cursor-pointer relative"
                    onClick={handleVolumeChange}
                  >
                    <div
                      className="absolute left-0 h-full bg-blue-500 rounded-full transition-all duration-150"
                      style={{ width: `${volume * 100}%` }}
                    />
                    <div
                      className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-y-1/2 transition-all duration-150 shadow-lg"
                      style={{ left: `${volume * 100}%`, top: '50%', marginLeft: '-6px' }}
                    />
                  </div>
                </div>

                {/* Volume Percentage Display */}
                <span className="text-white text-xs w-8 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {Math.round(volume * 100)}
                </span>
              </div>

              {/* Time Display */}
              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Speed Indicator */}
              {playbackSpeed !== 1 && (
                <div className="text-xs text-yellow-400 px-2 py-1 bg-black/50 rounded font-medium">
                  {playbackSpeed}x
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Restart */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setCurrentTime(0); // Immediate UI update
                  }
                }}
                className="text-white hover:text-blue-400 transition-colors"
                title="Restart video"
              >
                <RotateCcw size={20} />
              </button>

              {/* Documents */}
              {documents && documents.length > 0 && (
                <button
                  onClick={() => setShowDocuments(!showDocuments)}
                  className={`text-white hover:text-blue-400 transition-colors ${showDocuments ? 'text-blue-400' : ''}`}
                  title={`${documents.length} document${documents.length === 1 ? '' : 's'} attached`}
                >
                  <FileText size={20} />
                  {documents.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {documents.length}
                    </span>
                  )}
                </button>
              )}

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-blue-400 transition-colors"
                title="Settings"
              >
                <Settings size={20} />
              </button>

              {/* Download */}
              <a
                href={src}
                download
                className="text-white hover:text-blue-400 transition-colors"
                title="Download video"
              >
                <Download size={20} />
              </a>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-black/80 p-3 rounded text-xs text-gray-300">
          <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
          <div>Space: Play/Pause</div>
          <div>← →: Skip 10s</div>
          <div>↑ ↓: Volume</div>
          <div>M: Mute</div>
          <div>F: Fullscreen</div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
export type { DocumentAttachment };

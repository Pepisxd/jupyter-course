"use client";

import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

interface JupyterVideoPlayerProps {
  src: string;
  thumbnail?: string;
  title?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
}

export default function JupyterVideoPlayer({
  src,
  thumbnail = "/placeholder.svg?height=400&width=600",
  title,
  autoPlay = false,
  onEnded,
  className = "",
}: JupyterVideoPlayerProps) {
  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Estados
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false);
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Controlar reproducción
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasStarted) setHasStarted(true);

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Controlar volumen
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = Number.parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Controlar pantalla completa
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error al intentar mostrar pantalla completa: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Actualizar progreso del video
  const updateProgress = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;

      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
        setCurrentTime(currentTime);
      }
    }
  };

  // Cambiar posición del video al hacer clic en la barra de progreso
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!progressRef.current || !videoRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  // Avanzar o retroceder
  const skipTime = (e: React.MouseEvent, seconds: number) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Cambiar velocidad de reproducción
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowPlaybackMenu(false);
    }
  };

  // Formatear tiempo (segundos a MM:SS)
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Efecto para manejar eventos de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Efecto para ocultar controles después de un tiempo de inactividad
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);

      if (isPlaying) {
        timeout = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    if (playerRef.current) {
      playerRef.current.addEventListener("mousemove", handleMouseMove);
      playerRef.current.addEventListener("mouseleave", () =>
        setShowControls(false)
      );
      playerRef.current.addEventListener("mouseenter", () =>
        setShowControls(true)
      );
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.removeEventListener("mousemove", handleMouseMove);
        playerRef.current.removeEventListener("mouseleave", () =>
          setShowControls(false)
        );
        playerRef.current.removeEventListener("mouseenter", () =>
          setShowControls(true)
        );
      }
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPlaybackMenu && playerRef.current) {
        const isClickInside = playerRef.current.contains(event.target as Node);
        if (!isClickInside) {
          setShowPlaybackMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPlaybackMenu]);

  return (
    <div className="bg-[#2A2A2A] rounded-xl overflow-hidden">
      <div
        ref={playerRef}
        className={`relative overflow-hidden bg-black rounded-lg ${className}`}
        style={{ aspectRatio: "16/9" }}
        onClick={togglePlay}
      >
        {/* Miniatura (se muestra antes de iniciar el video) */}
        {!hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <img
              src={thumbnail}
              alt={title || "Video thumbnail"}
              className="w-full h-full object-contain"
            />
            <button
              onClick={togglePlay}
              className="absolute flex items-center justify-center w-20 h-20 rounded-full bg-[#FF5722]/90 hover:bg-[#FF5722] text-white transition-all transform hover:scale-110"
              aria-label="Reproducir video"
            >
              <Play className="w-10 h-10 ml-1" />
            </button>
          </div>
        )}

        {/* Video */}
        <video
          ref={videoRef}
          src={src}
          className={`w-full h-full object-contain ${
            !hasStarted ? "hidden" : ""
          }`}
          onTimeUpdate={updateProgress}
          onLoadedMetadata={() => {
            setIsLoading(false);
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            if (onEnded) onEnded();
          }}
          playsInline
        />

        {/* Overlay de carga */}
        {isLoading && hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-[#FF5722]/30 border-t-[#FF5722] rounded-full animate-spin"></div>
          </div>
        )}

        {/* Controles */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls || !isPlaying
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Título del video */}
          {title && (
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <h3 className="text-white text-lg font-medium">{title}</h3>
            </div>
          )}

          {/* Barra de progreso */}
          <div
            ref={progressRef}
            className="w-full h-2 bg-white/30 rounded-full mb-4 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-[#FF5722] rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Controles principales */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Botón de reproducción/pausa */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-[#FF5722] transition-colors p-2 rounded-full hover:bg-white/10"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </button>

              {/* Botones de avance/retroceso */}
              <button
                onClick={(e) => skipTime(e, -10)}
                className="text-white hover:text-[#FF5722] transition-colors p-2 rounded-full hover:bg-white/10"
                aria-label="Retroceder 10 segundos"
              >
                <SkipBack className="w-7 h-7" />
              </button>

              <button
                onClick={(e) => skipTime(e, 10)}
                className="text-white hover:text-[#FF5722] transition-colors p-2 rounded-full hover:bg-white/10"
                aria-label="Avanzar 10 segundos"
              >
                <SkipForward className="w-7 h-7" />
              </button>

              {/* Control de volumen */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-[#FF5722] transition-colors p-2 rounded-full hover:bg-white/10"
                  aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  {isMuted ? (
                    <VolumeX className="w-7 h-7" />
                  ) : (
                    <Volume2 className="w-7 h-7" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-[#FF5722] cursor-pointer"
                  aria-label="Volumen"
                />
              </div>

              {/* Tiempo actual / duración */}
              <div className="text-white text-base font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Velocidad de reproducción */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaybackMenu(!showPlaybackMenu);
                  }}
                  className="text-white hover:text-[#FF5722] transition-colors p-2 rounded-full hover:bg-white/10 flex items-center"
                  aria-label="Cambiar velocidad de reproducción"
                >
                  <Settings className="w-7 h-7 mr-2" />
                  <span className="text-base font-medium">{playbackRate}x</span>
                </button>

                {/* Menú desplegable de velocidad */}
                {showPlaybackMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-[#2A2A2A] rounded-lg shadow-lg py-2 min-w-[120px] z-50">
                    {playbackRates.map((rate) => (
                      <button
                        key={rate}
                        onClick={(e) => {
                          e.stopPropagation();
                          changePlaybackRate(rate);
                        }}
                        className={`w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center justify-between ${
                          rate === playbackRate ? "text-[#FF5722]" : ""
                        }`}
                      >
                        <span>{rate}x</span>
                        {rate === playbackRate && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón de pantalla completa */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-[#FF5722] transition-colors p-2 rounded-full hover:bg-white/10"
                aria-label={
                  isFullscreen
                    ? "Salir de pantalla completa"
                    : "Pantalla completa"
                }
              >
                {isFullscreen ? (
                  <Minimize className="w-7 h-7" />
                ) : (
                  <Maximize className="w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

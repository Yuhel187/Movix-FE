"use client";
import { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    RotateCcw,
    RotateCw,
} from "lucide-react";

export default function VideoPlayer({
    src,
    poster,
}: {
    src: string;
    poster?: string;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [showPoster, setShowPoster] = useState(true);
    const [showCenterIcon, setShowCenterIcon] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        if (src.endsWith(".m3u8") && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            return () => hls.destroy();
        } else {
            video.src = src;
        }
    }, [src]);

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;
        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
        } else {
            video.play();
            setIsPlaying(true);
            setShowPoster(false); 
        }

        setShowCenterIcon(true);
        setTimeout(() => setShowCenterIcon(false), 700);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolume = (value: number[]) => {
        const video = videoRef.current;
        if (!video) return;
        const vol = value[0];
        video.volume = vol;
        setVolume(vol);
        setIsMuted(vol === 0);
    };

    const handleSeek = (value: number[]) => {
        const video = videoRef.current;
        if (!video) return;
        const time = (value[0] / 100) * video.duration;
        video.currentTime = time;
        setProgress(value[0]);
    };

    const skip = (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime += seconds;
    };

    const toggleFullscreen = () => {
        const player = videoRef.current?.parentElement;
        if (!player) return;
        if (!document.fullscreenElement) player.requestFullscreen();
        else document.exitFullscreen();
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60)
            .toString()
            .padStart(2, "0");
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        const container = videoRef.current?.parentElement;
        container?.addEventListener("mousemove", handleMouseMove);
        container?.addEventListener("mouseleave", () => setShowControls(false));

        return () => {
            container?.removeEventListener("mousemove", handleMouseMove);
            container?.removeEventListener("mouseleave", () => setShowControls(false));
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="relative w-full max-w-5xl mx-auto bg-black rounded-2xl overflow-hidden shadow-lg group aspect-video">
            {/* Poster  */}
            {poster && (
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${showPoster
                            ? "opacity-100 pointer-events-auto z-20"
                            : "opacity-0 pointer-events-none z-0"
                        }`}
                >
                    <img
                        src={poster}
                        alt="Poster"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div
                        onClick={togglePlay}
                        className="relative z-30 bg-black/60 rounded-full p-6 cursor-pointer hover:scale-110 transition-transform duration-300"
                    >
                        <Play size={50} className="text-white" />
                    </div>
                </div>
            )}


            {/* Video */}
            <video
                ref={videoRef}
                className="w-full h-full rounded-xl select-none"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                playsInline
                controls={false}
            />

            {/* play/pause icon */}
            {showCenterIcon && !showPoster && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-500">
                    <div className="bg-black/40 p-4 rounded-full">
                        {isPlaying ? (
                            <Pause size={48} className="text-white" />
                        ) : (
                            <Play size={48} className="text-white" />
                        )}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div
                className={`absolute bottom-0 left-0 w-full transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* Progress bar */}
                <div className="px-4 mb-2">
                    <Slider
                        value={[progress]}
                        onValueChange={handleSeek}
                        max={100}
                        step={0.1}
                        className="cursor-pointer"
                    />
                </div>

                {/* Control bar */}
                <div className="w-full bg-gradient-to-t from-black/80 to-transparent px-4 py-2 flex items-center justify-between text-white transition-all duration-300 group-hover:py-3">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 h-9 w-9"
                            onClick={togglePlay}
                        >
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 h-9 w-9"
                            onClick={() => skip(-10)}
                        >
                            <RotateCcw size={18} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 h-9 w-9"
                            onClick={() => skip(10)}
                        >
                            <RotateCw size={18} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 h-9 w-9"
                            onClick={toggleMute}
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </Button>

                        <div className="w-24 ml-2">
                            <Slider
                                value={[volume]}
                                onValueChange={handleVolume}
                                max={1}
                                step={0.05}
                                className="cursor-pointer"
                            />
                        </div>

                        <span className="ml-3 text-sm text-gray-300 font-mono select-none">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 h-9 w-9"
                        onClick={toggleFullscreen}
                    >
                        <Maximize size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

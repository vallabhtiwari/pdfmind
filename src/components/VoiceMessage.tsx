import { VoiceMessageProps } from "@/lib/types";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function VoiceMessage({ blob }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const getAudioDuration = (blob: Blob): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const audioCtx = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const arrayBuffer = reader.result as ArrayBuffer;
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          resolve(audioBuffer.duration);
        } catch (err) {
          reject("Failed to decode audio data.");
        }
      };
      reader.onerror = () => reject("Failed to read audio blob.");
      reader.readAsArrayBuffer(blob);
    });
  };

  const seekToEventPosition = (clientX: number) => {
    if (
      progressBarRef &&
      progressBarRef.current &&
      audioRef &&
      audioRef.current
    ) {
      audioRef.current.pause();
      setIsPlaying(false);
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickRatio = Math.min(Math.max(clickX / rect.width, 0), 1);
      const newTime = duration * clickRatio;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    seekToEventPosition(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        seekToEventPosition(e.clientX);
      }
    };
    const handleMouseUp = () => {
      if (dragging) {
        setDragging(false);
        if (audioRef && audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  useEffect(() => {
    console.log(blob.size, blob.type);
    const audio = new Audio(URL.createObjectURL(blob));
    audioRef.current = audio;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnd);
    getAudioDuration(blob).then(setDuration);

    return () => {
      audio.pause();
      audio.remove();
    };
  }, [blob]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  return (
    <div className="flex items-center gap-3 p-2 w-md">
      <button
        onClick={togglePlay}
        className="text-gray-700 hover:text-orange-600 cursor-pointer"
      >
        {isPlaying ? <Pause /> : <Play />}
      </button>
      <div className="text-sm text-gray-500">{Math.floor(currentTime)}s</div>
      <div
        className="relative w-full h-1 bg-gray-300 rounded  cursor-pointer group"
        ref={progressBarRef}
        onMouseDown={handleMouseDown}
      >
        <div
          className="h-1 bg-orange-400 "
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md cursor-grab ${
            dragging ? "bg-orange-600 scale-120 opacity-100" : "bg-orange-500"
          } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          style={{
            left: `calc(${(currentTime / duration) * 100 || 0}% - 8px)`,
          }}
        />
      </div>
      <div className="text-sm text-gray-500">{Math.floor(duration)}s</div>
    </div>
  );
}

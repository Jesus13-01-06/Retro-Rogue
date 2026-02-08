import { useEffect, useRef } from 'react';

export const useMusic = (shouldPlay: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio instance only once
    if (!audioRef.current) {
      // Royalty-free retro track (Pixabay: "Arcade Retro Game")
      audioRef.current = new Audio('https://cdn.pixabay.com/audio/2021/08/09/audio_88447e769f.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15; // Subtle volume (0.0 to 1.0)
    }

    const audio = audioRef.current;

    if (shouldPlay) {
      // Attempt to play. Note: Browsers may block autoplay until user interaction.
      // Since 'shouldPlay' becomes true after the user clicks "Start" or "Restart",
      // this usually satisfies the interaction requirement.
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Audio playback prevented by browser policy:", error);
        });
      }
    } else {
      audio.pause();
      audio.currentTime = 0; // Reset track to beginning
    }

    // Cleanup on unmount
    return () => {
      audio.pause();
    };
  }, [shouldPlay]);
};
import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraConfig {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CameraError {
  type: "permission" | "not-supported" | "not-found" | "unknown";
  message: string;
}

export const useCamera = (config: CameraConfig = {}) => {
  const {
    facingMode = "environment",
    quality = 0.8,
    format = "image/jpeg",
  } = config;

  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<CameraError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // Check browser support
  useEffect(() => {
    const supported = !!navigator.mediaDevices?.getUserMedia;
    setIsSupported(supported);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  }, []);

  const createMediaStream = useCallback(
    async (facing: "user" | "environment") => {
      try {
        const constraints = {
          video: {
            facingMode: facing,
            width: { ideal: 1080 },
            height: { ideal: 1350 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!isMountedRef.current) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return null;
        }

        return stream;
      } catch (err: any) {
        let errorType: CameraError["type"] = "unknown";
        let errorMessage = "Failed to access camera";

        if (err.name === "NotAllowedError") {
          errorType = "permission";
          errorMessage = "Camera permission denied";
        } else if (err.name === "NotFoundError") {
          errorType = "not-found";
          errorMessage = "No camera device found";
        } else if (err.name === "NotSupportedError") {
          errorType = "not-supported";
          errorMessage = "Camera is not supported";
        }

        throw { type: errorType, message: errorMessage };
      }
    },
    [],
  );

  const setupVideo = useCallback(async (stream: MediaStream) => {
    if (!videoRef.current) return false;

    const video = videoRef.current;
    video.srcObject = stream;

    return new Promise<boolean>((resolve) => {
      const onLoadedMetadata = () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("error", onError);

        // Try to play the video
        video.play().catch((err) => {
          console.warn("Video autoplay failed:", err);
          // This is often okay - user interaction might be needed
        });

        resolve(true);
      };

      const onError = () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("error", onError);
        resolve(false);
      };

      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("error", onError);

      // Handle case where metadata is already loaded
      if (video.readyState >= 1) {
        onLoadedMetadata();
      }
    });
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (isSupported === false || isLoading) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clean up any existing stream
      cleanup();

      const stream = await createMediaStream(currentFacingMode);
      if (!stream) return false;

      streamRef.current = stream;
      const success = await setupVideo(stream);

      if (success && isMountedRef.current) {
        setIsActive(true);
        return true;
      }

      cleanup();
      return false;
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err);
      }

      cleanup();
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    isSupported,
    isLoading,
    currentFacingMode,
    cleanup,
    createMediaStream,
    setupVideo,
  ]);

  const stopCamera = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    cleanup();
    setError(null);

    // Small delay to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (isMountedRef.current) {
      setIsLoading(false);
    }
  }, [isLoading, cleanup]);

  const switchCamera = useCallback(
    async (newFacingMode?: "user" | "environment"): Promise<boolean> => {
      if (isSupported === false || isLoading) {
        return false;
      }

      const targetFacingMode =
        newFacingMode ||
        (currentFacingMode === "user" ? "environment" : "user");

      setIsLoading(true);
      setError(null);

      try {
        // Clean up current stream
        cleanup();

        // Update facing mode
        setCurrentFacingMode(targetFacingMode);

        // Small delay to ensure cleanup
        await new Promise((resolve) => setTimeout(resolve, 100));

        const stream = await createMediaStream(targetFacingMode);
        if (!stream) return false;

        streamRef.current = stream;
        const success = await setupVideo(stream);

        if (success && isMountedRef.current) {
          setIsActive(true);
          return true;
        }

        cleanup();
        return false;
      } catch (err: any) {
        if (isMountedRef.current) {
          setError(err);
        }

        cleanup();
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [
      isSupported,
      isLoading,
      currentFacingMode,
      cleanup,
      createMediaStream,
      setupVideo,
    ],
  );

  const retry = useCallback(async (): Promise<boolean> => {
    if (isLoading) return false;

    setError(null);
    await stopCamera();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return startCamera();
  }, [isLoading, stopCamera, startCamera]);

  const capturePhoto = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current || !isActive) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas to exact 4:5 portrait (1080x1350)
      const targetW = 1080;
      const targetH = 1350;
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      const videoW = video.videoWidth;
      const videoH = video.videoHeight;

      // Center-crop video to 4:5 ratio
      const targetRatio = targetW / targetH; // 0.8
      const videoRatio = videoW / videoH;

      let srcX = 0;
      let srcY = 0;
      let srcW = videoW;
      let srcH = videoH;
      if (videoRatio > targetRatio) {
        // video is wider — crop width
        srcW = videoH * targetRatio;
        srcX = (videoW - srcW) / 2;
      } else {
        // video is taller — crop height
        srcH = videoW / targetRatio;
        srcY = (videoH - srcH) / 2;
      }

      // Mirror front camera and draw cropped region
      if (currentFacingMode === "user") {
        ctx.scale(-1, 1);
        ctx.drawImage(
          video,
          srcX,
          srcY,
          srcW,
          srcH,
          -targetW,
          0,
          targetW,
          targetH,
        );
      } else {
        ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const extension = format.split("/")[1];
            const file = new File([blob], `photo_${Date.now()}.${extension}`, {
              type: format,
            });
            resolve(file);
          } else {
            resolve(null);
          }
        },
        format,
        quality,
      );
    });
  }, [isActive, format, quality, currentFacingMode]);

  return {
    // State
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,

    // Actions
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,

    // Refs for components
    videoRef,
    canvasRef,
  };
};

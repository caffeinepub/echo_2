/**
 * useVideoUpload — uploads a video Blob to the backend canister blob storage
 * via actor.uploadVideoBlob() / actor.uploadPreviewBlob() and returns the
 * stable asset_id strings to use as video_file_url / preview_loop_url in createClip().
 *
 * This replaces the old gateway-URL approach which silently failed because the
 * project has no configured object-storage gateway URL.
 */
import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useState } from "react";
import { createActor } from "../backend";

export interface UploadResult {
  videoUrl: string;
  previewUrl: string;
}

interface UploadState {
  uploading: boolean;
  progress: number; // 0–100
  error: string | null;
}

export function useVideoUpload() {
  const { actor, isFetching } = useActor(createActor);

  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const uploadVideo = useCallback(
    async (videoBlob: Blob): Promise<UploadResult> => {
      setState({ uploading: true, progress: 0, error: null });

      if (!actor || isFetching) {
        const msg = "Not connected to backend. Please wait and try again.";
        setState({ uploading: false, progress: 0, error: msg });
        throw new Error(msg);
      }

      try {
        setState({ uploading: true, progress: 10, error: null });

        // Convert blob to Uint8Array for the backend call
        const arrayBuffer = await videoBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        setState({ uploading: true, progress: 30, error: null });

        // Detect content type — MediaRecorder typically produces video/webm on desktop
        // and sometimes video/mp4 on iOS Safari. Accept whatever the browser gives us.
        const contentType = videoBlob.type || "video/webm";

        // Upload the main HD video to backend blob storage
        const videoAssetId = await actor.uploadVideoBlob(
          uint8Array,
          contentType,
        );

        setState({ uploading: true, progress: 70, error: null });

        // For the preview, reuse the same blob (short clip as-is).
        // We use the same Uint8Array — the backend stores it separately.
        const previewAssetId = await actor.uploadPreviewBlob(
          uint8Array,
          contentType,
        );

        setState({ uploading: false, progress: 100, error: null });

        return {
          videoUrl: videoAssetId,
          previewUrl: previewAssetId,
        };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.";
        setState({ uploading: false, progress: 0, error: message });
        throw new Error(message);
      }
    },
    [actor, isFetching],
  );

  return { uploadVideo, ...state };
}

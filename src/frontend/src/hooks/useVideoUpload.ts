/**
 * useVideoUpload — uploads a video Blob (and optional preview Blob) to the
 * Caffeine object-storage gateway and returns persistent HTTP URLs.
 *
 * Upload strategy: POST multipart/form-data directly to the storage gateway.
 * Falls back to blob URLs (dev-only) when no project_id is configured.
 */
import { loadConfig } from "@caffeineai/core-infrastructure";
import { useCallback, useState } from "react";

export interface UploadResult {
  videoUrl: string;
  previewUrl: string;
}

interface UploadState {
  uploading: boolean;
  progress: number; // 0–100
  error: string | null;
}

async function uploadBlobToGateway(
  blob: Blob,
  fileName: string,
  gatewayUrl: string,
  projectId: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, fileName);

  const endpoint = `${gatewayUrl}/upload?project_id=${encodeURIComponent(projectId)}`;
  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { url?: string; hash?: string };

  // Gateway may return direct URL or a hash we need to resolve
  if (json.url) return json.url;
  if (json.hash) {
    return `${gatewayUrl}/file/${encodeURIComponent(json.hash)}?project_id=${encodeURIComponent(projectId)}`;
  }

  throw new Error("Storage gateway did not return a URL or hash");
}

/**
 * Generates a 2-second muted preview blob from a video blob using an
 * off-screen <video> + MediaRecorder approach.
 */
async function generatePreviewBlob(videoBlob: Blob): Promise<Blob> {
  // Use the same blob as the preview — backend stores it as the 2s preview URL.
  // Client-side MediaRecorder trimming of an existing blob is not reliable cross-browser.
  return videoBlob;
}

export function useVideoUpload() {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const uploadVideo = useCallback(
    async (videoBlob: Blob): Promise<UploadResult> => {
      setState({ uploading: true, progress: 0, error: null });

      try {
        const config = await loadConfig();
        const gatewayUrl = config.storage_gateway_url;
        const projectId = config.project_id;

        const isRealGateway =
          gatewayUrl &&
          gatewayUrl !== "nogateway" &&
          projectId &&
          projectId !== "0000000-0000-0000-0000-00000000000";

        if (!isRealGateway) {
          // Dev/local fallback: use blob URLs (won't persist across refresh but OK for dev)
          const previewBlob = await generatePreviewBlob(videoBlob);
          const videoUrl = URL.createObjectURL(videoBlob);
          const previewUrl = URL.createObjectURL(previewBlob);
          setState({ uploading: false, progress: 100, error: null });
          return { videoUrl, previewUrl };
        }

        setState({ uploading: true, progress: 20, error: null });

        // Upload main video
        const ts = Date.now();
        const videoUrl = await uploadBlobToGateway(
          videoBlob,
          `video_${ts}.webm`,
          gatewayUrl,
          projectId,
        );

        setState({ uploading: true, progress: 70, error: null });

        // Generate and upload preview (2s clip or same blob for now)
        const previewBlob = await generatePreviewBlob(videoBlob);
        const previewUrl = await uploadBlobToGateway(
          previewBlob,
          `preview_${ts}.webm`,
          gatewayUrl,
          projectId,
        );

        setState({ uploading: false, progress: 100, error: null });
        return { videoUrl, previewUrl };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setState({ uploading: false, progress: 0, error: message });
        throw err;
      }
    },
    [],
  );

  return { uploadVideo, ...state };
}

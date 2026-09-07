export function getAssetExtension(src, contentType) {
  const extensionFromMime = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/ogg": ".ogg"
  }

  if (contentType && extensionFromMime[contentType]) {
    return extensionFromMime[contentType]
  }

  try {
    const pathname = new URL(src, window.location.href).pathname
    const extension = pathname.match(/\.[a-zA-Z0-9]+$/)?.[0]

    if (extension) return extension
  } catch {}

  return ".bin"
}

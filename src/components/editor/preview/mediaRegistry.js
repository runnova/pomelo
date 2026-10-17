export const previewMedia = new Map();

export function stopMediaElement(media) {
  try { media.pause(); } catch {}
  media.removeAttribute("src");
  media.load();
}

export function stopMediaNotIn(card) {
  const ids = new Set(card.nodes.map((n) => n.id));
  for (const [nodeId, { el, cardId }] of previewMedia) {
    if (cardId !== card.id || !ids.has(nodeId)) stopMediaElement(el);
  }
}

export function stopAllMedia() {
  for (const { el } of previewMedia.values()) stopMediaElement(el);
  previewMedia.clear();
}

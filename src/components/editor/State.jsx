import { createStore, unwrap } from "solid-js/store"
import { zipSync, unzipSync, strToU8 } from "fflate"
import { getAssetExtension } from "../utility/Utility"

const id = () => crypto.randomUUID()
let clipboardNode = null

const blobUrlCache = new Map()

function getOrCreateBlobUrl(asset) {
  if (blobUrlCache.has(asset.id)) {
    return blobUrlCache.get(asset.id)
  }

  const blob = new Blob([asset.data], { type: asset.mimeType || "" })
  const url = URL.createObjectURL(blob)

  blobUrlCache.set(asset.id, url)

  return url
}

function revokeBlobUrl(assetId) {
  const url = blobUrlCache.get(assetId)

  if (url) {
    URL.revokeObjectURL(url)
    blobUrlCache.delete(assetId)
  }
}

function clearBlobUrlCache() {
  for (const url of blobUrlCache.values()) {
    URL.revokeObjectURL(url)
  }

  blobUrlCache.clear()
}

export const [project, setProject] = createStore({
  id: id(),

  meta: {
    title: "",
    author: "",
    created: Date.now(),
    modified: Date.now(),
    version: 1
  },

  cards: [createCard()],

  // embedded, packageable files. node.src references these by `id`.
  assets: []
})

export function createCard() {
  return {
    id: id(),

    meta: {
      title: ""
    },

    background: {
      type: "color",
      value: "#ffffff",
      fit: "cover",
      autoplay: true
    },

    layout: {
      ratio: [1, 1],
      padding: 24,
      gap: 16
    },

    textColumn: "left",

    nodes: []
  }
}

export const defaultTextStyle = {
  "font-size": "16px",
  "font-weight": 400,
  "font-style": "normal",
  "line-height": "1.5",
  "letter-spacing": "normal",
  "text-align": "left",
  "text-decoration": "none"
}

export function createTextNode() {
  return {
    id: id(),
    type: "text",
    column: "text",
    content: "",
    style: {}
  }
}
export function createMediaNode() {
  return {
    id: id(),

    type: "media",

    column: "media",

    src: "", // asset id, or an external URL

    mediaType: "image",

    caption: "",

    credit: "",

    fit: "contain",

    autoplay: false,

    loop: false,

    muted: false,

    controls: true
  }
}

export function getNodeStyle(node, property) {
  return node.style?.[property] ?? defaultTextStyle[property]
}

// ================= Embedded assets =================

export async function embedFile(file) {
  const buffer = await file.arrayBuffer()
  const data = new Uint8Array(buffer)

  const extension = getAssetExtension(file.name, file.type)

  const asset = {
    id: id(),
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    extension,
    size: data.byteLength,
    data
  }

  setProject("assets", assets => [...assets, asset])

  return asset.id
}

export async function embedFileFromUrl(url, name) {
  const existing = project.assets.find(asset => asset.sourceUrl === url)
  if (existing) return existing.id

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${url}`)
  }

  const buffer = await response.arrayBuffer()
  const data = new Uint8Array(buffer)
  const mimeType = response.headers.get("content-type") || ""
  const extension = getAssetExtension(url, mimeType)
  const filename = name || url.split("/").pop()?.split("?")[0] || `asset${extension}`

  const asset = {
    id: id(),
    name: filename,
    mimeType,
    extension,
    size: data.byteLength,
    sourceUrl: url,
    data
  }

  setProject("assets", assets => [...assets, asset])

  return asset.id
}

export function getEmbeddedFileById(assetId) {
  return project.assets.find(asset => asset.id === assetId) ?? null
}

export function listEmbedded() {
  return project.assets
}

export function removeEmbeddedFile(assetId) {
  const index = project.assets.findIndex(asset => asset.id === assetId)

  if (index === -1) return

  revokeBlobUrl(assetId)

  setProject("assets", assets => assets.filter(asset => asset.id !== assetId))
}

export function cleanupUnusedAssets() {
  const usedIds = new Set()

  for (const card of project.cards) {
    for (const node of card.nodes) {
      if (node.type === "media" && node.src) {
        usedIds.add(node.src)
      }
    }
  }

  const unused = project.assets.filter(asset => !usedIds.has(asset.id))

  for (const asset of unused) {
    removeEmbeddedFile(asset.id)
  }

  return unused.map(asset => asset.id)
}

export function downloadEmbeddedFileById(assetId) {
  const asset = getEmbeddedFileById(assetId)

  if (!asset) return

  const url = getOrCreateBlobUrl(asset)

  const a = document.createElement("a")
  a.href = url
  a.download = asset.name || `${asset.id}${asset.extension || ""}`
  a.click()
}

// Global helper: resolve a node's `src` (asset id OR external URL) to
// something the browser can render. Blob URLs are only created here,
// on first access, and reused afterwards.
export function resolveAssetSrc(src) {
  if (!src) return src

  const asset = project.assets.find(a => a.id === src)

  if (asset) {
    return getOrCreateBlobUrl(asset)
  }

  // not an embedded asset — treat as a plain external URL / already-a-blob-url
  return src
}

// ================= Cards / nodes (unchanged) =================

export function addCard() {
  const card = createCard()

  setProject("cards", cards => [...cards, card])
  setEditor("card", "current", card.id)
}

export function removeCard(cardId) {
  const index = project.cards.findIndex(card => card.id === cardId)

  if (index === -1) return

  const remaining = project.cards.filter(card => card.id !== cardId)

  setProject("cards", remaining)

  if (editor.card.current === cardId) {
    setEditor(
      "card",
      "current",
      remaining[Math.max(0, index - 1)]?.id ?? null
    )
  }
}

export function updateCard(cardId, updater) {
  const index = project.cards.findIndex(card => card.id === cardId)

  if (index === -1) return

  setProject("cards", index, updater)
}

export function moveCard(sourceId, targetIndex) {
  const cards = [...project.cards]

  const sourceIndex = cards.findIndex(card => card.id === sourceId)
  if (sourceIndex === -1) return

  const [card] = cards.splice(sourceIndex, 1)

  const clampedIndex = Math.max(0, Math.min(targetIndex, cards.length))

  cards.splice(clampedIndex, 0, card)

  setProject("cards", cards)
}

export function addNode(cardId, node) {
  const index = project.cards.findIndex(card => card.id === cardId)

  if (index === -1) return

  setProject("cards", index, "nodes", nodes => [...nodes, node])
}

export function removeNode(cardId, nodeId) {
  const cardIndex = project.cards.findIndex(card => card.id === cardId)

  if (cardIndex === -1) return

  setProject(
    "cards",
    cardIndex,
    "nodes",
    nodes => nodes.filter(node => node.id !== nodeId)
  )
}

export function updateNode(cardId, nodeId, updater) {
  const cardIndex = project.cards.findIndex(card => card.id === cardId)

  if (cardIndex === -1) return

  const nodeIndex = project.cards[cardIndex].nodes.findIndex(
    node => node.id === nodeId
  )

  if (nodeIndex === -1) return

  setProject("cards", cardIndex, "nodes", nodeIndex, updater)
}

export function updateNodeById(nodeId, updater) {
  const cardIndex = project.cards.findIndex(card =>
    card.nodes.some(node => node.id === nodeId)
  )

  if (cardIndex === -1) return

  const nodeIndex = project.cards[cardIndex].nodes.findIndex(
    node => node.id === nodeId
  )

  if (nodeIndex === -1) return

  setProject("cards", cardIndex, "nodes", nodeIndex, updater)
}

export function getCardIndex(cardId) {
  return project.cards.findIndex(card => card.id === cardId)
}

export function loadProject(data) {
  clearBlobUrlCache()
  setProject(data)
}

export function serializeNode(node) {
  if (node.type === "text") {
    return serializeTextNode(node)
  }

  return node
}

export function serializeTextNode(node) {
  const style = {}

  for (const [property, value] of Object.entries(node.style ?? {})) {
    if (value !== defaultTextStyle[property]) {
      style[property] = value
    }
  }

  return {
    id: node.id,
    type: node.type,
    column: node.column,
    content: node.content,
    ...(Object.keys(style).length > 0 ? { style } : {})
  }
}

export function saveProject() {
  const data = unwrap(project)

  const serialized = {
    ...data,

    cards: data.cards.map(card => ({
      ...card,
      nodes: card.nodes.map(serializeNode)
    })),

    // exclude raw binary from plain JSON saves; keep metadata only
    assets: data.assets.map(({ data: _bytes, ...meta }) => meta)
  }

  return JSON.stringify(serialized, null, 2)
}

export function getCurrentCard() {
  let card = project.cards.find(card => card.id === editor.card.current)

  if (!card && project.cards.length > 0) {
    card = project.cards[0]
    setEditor("card", "current", card.id)
  }

  return card ?? null
}

export function focusNode(nodeId) {
  setEditor("focus", nodeId)
}

export function blurNode() {
  setEditor("focus", null)
}

export function getFocusedNode() {
  if (!editor.focus) return null

  const card = getCurrentCard()
  if (!card) return null

  return card.nodes.find(node => node.id === editor.focus) ?? null
}

export const [editor, setEditor] = createStore({
  projectPath: null,
  dirty: false,
  previewMode: "visual",

  focus: null,

  card: {
    current: null,
    hover: null,
    selected: []
  },

  node: {
    current: null,
    hover: null,
    selected: []
  },

  heading: {
    current: null
  },

  timeline: {
    zoom: 1,
    scroll: 0
  },

  preview: {
    zoom: 1,
    pan: { x: 0, y: 0 }
  },

  sidebar: {
    tab: "card"
  },

  history: {
    undo: [],
    redo: []
  }
})

export function copyNode(nodeId) {
  const card = project.cards.find(card =>
    card.nodes.some(node => node.id === nodeId)
  )

  if (!card) return

  const node = card.nodes.find(node => node.id === nodeId)
  clipboardNode = structuredClone(unwrap(node))
}

export function pasteNode(cardId) {
  if (!clipboardNode) return

  const node = structuredClone(unwrap(clipboardNode))
  node.id = id()

  addNode(cardId, node)

  return node
}

export function duplicateNode(nodeId) {
  const card = project.cards.find(card =>
    card.nodes.some(node => node.id === nodeId)
  )

  if (!card) return

  const node = card.nodes.find(node => node.id === nodeId)
  const copy = structuredClone(unwrap(node))
  copy.id = id()

  addNode(card.id, copy)

  return copy
}

export function hasClipboardNode() {
  return clipboardNode !== null
}

export function moveNode(cardId, nodeId, targetColumn, targetIndex) {
  const cardIndex = project.cards.findIndex(c => c.id === cardId)
  if (cardIndex === -1) return

  const nodes = [...project.cards[cardIndex].nodes]

  const sourceIndex = nodes.findIndex(n => n.id === nodeId)
  if (sourceIndex === -1) return

  const node = {
    ...nodes[sourceIndex],
    column: targetColumn
  }

  nodes.splice(sourceIndex, 1)

  const filtered = nodes.filter(n => n.column === targetColumn)

  let insertBefore

  if (targetIndex >= filtered.length) {
    insertBefore = nodes.findIndex(n => n.column === targetColumn)
    if (insertBefore === -1) {
      nodes.push(node)
    } else {
      let last = -1
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].column === targetColumn) last = i
      }
      nodes.splice(last + 1, 0, node)
    }
  } else {
    const targetId = filtered[targetIndex].id
    insertBefore = nodes.findIndex(n => n.id === targetId)
    nodes.splice(insertBefore, 0, node)
  }

  setProject("cards", cardIndex, "nodes", nodes)
}

// ================= Export / Import =================

export async function exportProject() {
  const data = unwrap(project)

  const serialized = {
    ...data,

    cards: data.cards.map(card => ({
      ...card,
      nodes: card.nodes.map(serializeNode)
    })),

    assets: data.assets.map(({ data: _bytes, ...meta }) => meta)
  }

  const files = {}

  for (const asset of data.assets) {
    files[`assets/${asset.id}${asset.extension || ""}`] = asset.data
  }

  files["project.json"] = strToU8(
    JSON.stringify(serialized, null, 2)
  )

  const zipped = zipSync(files, {
    level: 6
  })

  const blob = new Blob([zipped], {
    type: "application/zip"
  })

  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${project.meta.title || "project"}.zip`
  a.click()

  URL.revokeObjectURL(url)
}

export async function importProject(file) {
  const buffer = await file.arrayBuffer()
  const files = unzipSync(new Uint8Array(buffer))

  const projectFile = files["project.json"]

  if (!projectFile) {
    throw new Error("Invalid project: project.json is missing")
  }

  const data = JSON.parse(
    new TextDecoder().decode(projectFile)
  )

  data.assets = (data.assets ?? []).map(meta => {
    const path = `assets/${meta.id}${meta.extension || ""}`
    const bytes = files[path]

    return {
      ...meta,
      data: bytes ?? new Uint8Array()
    }
  })

  loadProject(data)

  setEditor("card", "current", data.cards?.[0]?.id ?? null)
  setEditor("focus", null)
  setEditor("card", "selected", [])
  setEditor("node", "selected", [])

  return data
}

export function setPreviewMode(mode) {
  setEditor("previewMode", mode)
}

export function setCardRaw(cardId, data) {
  const index = project.cards.findIndex(card => card.id === cardId)
  if (index === -1) return
  setProject("cards", index, data)
}

export function buildNodeFromTemplateDef(def) {
  const node = def.type === "media" ? createMediaNode() : createTextNode();

  const { icon, label, type, ...fields } = def;
  Object.assign(node, fields);

  return node;
}

export function getProjectHeadings() {
  return project.cards.flatMap(card =>
    card.nodes
      .filter(node =>
        ["H1", "H2", "H3", "Sub"].includes(node.heading)
      )
      .map(node => ({
        cardId: card.id,
        node
      }))
  )
}

export function setCardRatio(cardId, ratio) {
  const index = project.cards.findIndex(card => card.id === cardId)
  if (index === -1) return
  setProject("cards", index, "layout", "ratio", ratio)
}

window.app = {
  project,
  setProject,

  editor,
  setEditor,

  createCard,
  createTextNode,
  createMediaNode,

  addCard,
  removeCard,
  updateCard,
  moveCard,

  addNode,
  removeNode,
  updateNode,

  loadProject,
  saveProject,
  importProject,
  exportProject,

  getCurrentCard,
  getProjectHeadings,

  focusNode,
  blurNode,
  getFocusedNode,

  embedFile,
  embedFileFromUrl,
  getEmbeddedFileById,
  listEmbedded,
  removeEmbeddedFile,
  cleanupUnusedAssets,
  downloadEmbeddedFileById,
  resolveAssetSrc
}

import { createStore, unwrap } from "solid-js/store"

import {
  HiOutlinePhoto,
  HiOutlineDocumentText
} from "solid-icons/hi";

const id = () => crypto.randomUUID()
let clipboardNode = null

import sampleMedia from "../../assets/sample.png"

export const quickInsertTemplates = {
  H1: {
    label: "Heading 1",
    icon: HiOutlineDocumentText,
    type: "text",
    content: "Heading 1",
    style: {
      "font-size": "48px",
      "font-weight": 700,
      "line-height": "1.1"
    }
  },

  H2: {
    label: "Heading 2",
    icon: HiOutlineDocumentText,
    type: "text",
    content: "Heading 2",
    style: {
      "font-size": "36px",
      "font-weight": 700,
      "line-height": "1.2"
    }
  },

  H3: {
    label: "Heading 3",
    icon: HiOutlineDocumentText,
    type: "text",
    content: "Heading 3",
    style: {
      "font-size": "28px",
      "font-weight": 600,
      "line-height": "1.3"
    }
  },

  Sub: {
    label: "Subtitle",
    icon: HiOutlineDocumentText,
    type: "text",
    content: "Subtitle",
    style: {
      "font-size": "20px",
      "line-height": "1.4"
    }
  },

  P: {
    label: "Paragraph",
    icon: HiOutlineDocumentText,
    type: "text",
    content: "Paragraph text",
    style: {}
  },

  MediaTiny: {
    label: "Media Tiny",
    icon: HiOutlinePhoto,
    type: "media",
    content: "Media",
    mediaType: "image",
    src: sampleMedia,
    style: {
      "height": "25%"
    }
  },

  MediaBox: {
    label: "Media Half",
    icon: HiOutlinePhoto,
    type: "media",
    content: "Media",
    mediaType: "image",
    src: sampleMedia,
    style: {
      "height": "50%"
    }
  },

  MediaVertical: {
    label: "Media Full",
    icon: HiOutlinePhoto,
    type: "media",
    content: "Media",
    mediaType: "image",
    src: sampleMedia,
    style: {
      "height": "100%"
    }
  }
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

  cards: [createCard()]
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

    src: "",

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
  console.log(cardId, nodeId)
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
    }))
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

export function exportProject() {
  const data = saveProject()

  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${project.meta.title || "project"}.json`
  a.click()

  URL.revokeObjectURL(url)
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
  const { icon, label, style, ...fields } = def

  const node = def.type === "media"
    ? createMediaNode()
    : createTextNode()

  Object.assign(node, fields)

  if (def.type === "text") {
    node.style = { ...style }
  } else if (style) {
    node.style = { ...style }
  }

  return node
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

  getCurrentCard,

  focusNode,
  blurNode,
  getFocusedNode,

  exportProject
}

import { createStore, unwrap } from "solid-js/store"

const id = () => crypto.randomUUID()
let clipboardNode = null

export const [project, setProject] = createStore({
  id: id(),

  meta: {
    title: "",
    author: "",
    created: Date.now(),
    modified: Date.now(),
    version: 1
  },

  cards: []
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

export function createTextNode() {
  return {
    id: id(),

    type: "text",

    column: "text",

    content: "",

    level: null,

    footnote: null,

    color: "#000000",
    fontSize: "16px",
    fontFamily: "sans-serif",
    fontWeight: "400",
    fontStyle: "normal",
    textAlign: "left",
    lineHeight: "1.5",
    letterSpacing: "normal",
    textDecoration: "none"
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

export function saveProject() {
  return JSON.stringify(project, null, 2)
}

export function getCurrentCard() {
  return project.cards.find(card => card.id === editor.card.current) ?? null
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
  const data = JSON.stringify(unwrap(project), null, 2)

  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${project.meta.title || "project"}.json`
  a.click()

  URL.revokeObjectURL(url)
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
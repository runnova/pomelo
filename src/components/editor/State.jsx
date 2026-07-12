import { createStore } from "solid-js/store"

const id = () => crypto.randomUUID()

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

    meta: {},

    content: "",

    level: null,

    footnote: null
  }
}

export function createMediaNode() {
  return {
    id: id(),

    type: "media",

    column: "media",

    meta: {},

    src: "",

    mediaType: "image",

    caption: "",

    credit: "",

    fit: "contain",

    autoplay: false,

    loop: false
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

export const [editor, setEditor] = createStore({
  projectPath: null,
  dirty: false,

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

  getCurrentCard
}
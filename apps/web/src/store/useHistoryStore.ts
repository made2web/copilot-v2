import { create } from "zustand"
import { useBlockStore } from "./useBlockStore"
import { usePageStore } from "./usePageStore"
import { useScreenSizeStore } from "./useScreenSizeStore"

interface HistoryState {
  past: AppState[]
  future: AppState[]
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  pushState: () => void
}

interface AppState {
  blocks: ReturnType<typeof useBlockStore.getState>
  pages: ReturnType<typeof usePageStore.getState>
  screenSize: ReturnType<typeof useScreenSizeStore.getState>
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  undo: () => {
    const { past, future } = get()
    if (past.length === 0) return

    const newPast = [...past]
    const previousState = newPast.pop()!
    const currentState = getCurrentState()
    const newFuture = [currentState, ...future]

    set({
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    })

    applyState(previousState)
  },

  redo: () => {
    const { past, future } = get()
    if (future.length === 0) return

    const newFuture = [...future]
    const nextState = newFuture.shift()!
    const currentState = getCurrentState()
    const newPast = [...past, currentState]

    set({
      past: newPast,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    })

    applyState(nextState)
  },

  pushState: () => {
    const { past, future } = get()
    const currentState = getCurrentState()
    const newPast = [...past, currentState]
    set({
      past: newPast,
      future: [],
      canUndo: true,
      canRedo: false,
    })
  },
}))

function getCurrentState(): AppState {
  return {
    blocks: useBlockStore.getState(),
    pages: usePageStore.getState(),
    screenSize: useScreenSizeStore.getState(),
  }
}

function applyState(state: AppState) {
  useBlockStore.setState(state.blocks)
  usePageStore.setState(state.pages)
  useScreenSizeStore.setState(state.screenSize)
}

// Middleware to automatically push state on every action
const historyMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      set(...args)
      useHistoryStore.getState().pushState()
    },
    get,
    api,
  )

// Apply middleware to all stores
useBlockStore.setState = historyMiddleware(useBlockStore.setState)
usePageStore.setState = historyMiddleware(usePageStore.setState)
useScreenSizeStore.setState = historyMiddleware(useScreenSizeStore.setState)


import { create } from "zustand"
import type { Page } from "../hooks/useCanvas"

interface PageState {
  pages: Page[]
  currentPageId: string
  addPage: () => void
  switchPage: (pageId: string) => void
  renamePage: (pageId: string, newName: string) => void
  deletePage: (pageId: string) => void
}

export const usePageStore = create<PageState>((set, get) => ({
  pages: [{ id: "page-1", name: "Page 1", blocks: [] }],
  currentPageId: "page-1",
  addPage: () =>
    set((state) => {
      const newPageId = `page-${Date.now()}`
      const newPage: Page = {
        id: newPageId,
        name: `Page ${state.pages.length + 1}`,
        blocks: [],
      }
      return {
        pages: [...state.pages, newPage],
        currentPageId: newPageId,
      }
    }),
  switchPage: (pageId: string) => set({ currentPageId: pageId }),
  renamePage: (pageId: string, newName: string) =>
    set((state) => ({
      pages: state.pages.map((page) => (page.id === pageId ? { ...page, name: newName } : page)),
    })),
  deletePage: (pageId: string) =>
    set((state) => {
      if (state.pages.length === 1) {
        return state // Prevent deleting the last page
      }
      const newPages = state.pages.filter((page) => page.id !== pageId)
      return {
        pages: newPages,
        currentPageId: state.currentPageId === pageId ? newPages[0].id : state.currentPageId,
      }
    }),
}))


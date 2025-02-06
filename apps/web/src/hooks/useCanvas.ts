import { useState, useCallback } from "react"
import type { ScreenSize } from "../components/ResponsiveControls"

export type BlockType =
  | "Header"
  | "Hero"
  | "HeroImageRight"
  | "HeroImageLeft"
  | "Features"
  | "FeaturesGrid"
  | "FeaturesAlternating"
  | "FAQs"
  | "Footer"

export interface SectionProperties {
  backgroundColor: string
  paddingTop: string
  paddingBottom: string
}

export interface Block {
  id: string
  type: BlockType
  properties: Record<string, any>
  sectionProperties: SectionProperties
}

export interface Page {
  id: string
  name: string
  blocks: Block[]
}

interface CanvasState {
  pages: Page[]
  currentPageId: string
  selectedBlockId: string | null
}

export const useCanvas = () => {
  const [history, setHistory] = useState<CanvasState[]>([
    {
      pages: [{ id: "page-1", name: "Page 1", blocks: [] }],
      currentPageId: "page-1",
      selectedBlockId: null,
    },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop")

  const currentState = history[currentIndex]

  const updateHistory = useCallback(
    (newState: CanvasState) => {
      const newHistory = history.slice(0, currentIndex + 1)
      newHistory.push(newState)
      setHistory(newHistory)
      setCurrentIndex(newHistory.length - 1)
    },
    [history, currentIndex],
  )

  const addPage = useCallback(() => {
    const newPageId = `page-${Date.now()}`
    const newPage: Page = {
      id: newPageId,
      name: `Page ${currentState.pages.length + 1}`,
      blocks: [],
    }
    updateHistory({
      ...currentState,
      pages: [...currentState.pages, newPage],
      currentPageId: newPageId,
    })
  }, [currentState, updateHistory])

  const switchPage = useCallback(
    (pageId: string) => {
      updateHistory({
        ...currentState,
        currentPageId: pageId,
        selectedBlockId: null,
      })
    },
    [currentState, updateHistory],
  )

  const renamePage = useCallback(
    (pageId: string, newName: string) => {
      updateHistory({
        ...currentState,
        pages: currentState.pages.map((page) => (page.id === pageId ? { ...page, name: newName } : page)),
      })
    },
    [currentState, updateHistory],
  )

  const deletePage = useCallback(
    (pageId: string) => {
      if (currentState.pages.length === 1) {
        return // Prevent deleting the last page
      }
      const newPages = currentState.pages.filter((page) => page.id !== pageId)
      updateHistory({
        pages: newPages,
        currentPageId: newPages[0].id,
        selectedBlockId: null,
      })
    },
    [currentState, updateHistory],
  )

  const addBlock = useCallback(
    (type: BlockType) => {
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        type,
        properties: getDefaultProperties(type),
        sectionProperties: getDefaultSectionProperties(),
      }
      updateHistory({
        ...currentState,
        pages: currentState.pages.map((page) =>
          page.id === currentState.currentPageId ? { ...page, blocks: [...page.blocks, newBlock] } : page,
        ),
      })
    },
    [currentState, updateHistory],
  )

  const removeBlock = useCallback(
    (id: string) => {
      updateHistory({
        ...currentState,
        pages: currentState.pages.map((page) =>
          page.id === currentState.currentPageId
            ? { ...page, blocks: page.blocks.filter((block) => block.id !== id) }
            : page,
        ),
        selectedBlockId: currentState.selectedBlockId === id ? null : currentState.selectedBlockId,
      })
    },
    [currentState, updateHistory],
  )

  const duplicateBlock = useCallback(
    (id: string) => {
      const currentPage = currentState.pages.find((page) => page.id === currentState.currentPageId)
      if (!currentPage) return

      const blockToDuplicate = currentPage.blocks.find((block) => block.id === id)
      if (blockToDuplicate) {
        const newBlock: Block = {
          ...blockToDuplicate,
          id: `block-${Date.now()}`,
        }
        updateHistory({
          ...currentState,
          pages: currentState.pages.map((page) =>
            page.id === currentState.currentPageId ? { ...page, blocks: [...page.blocks, newBlock] } : page,
          ),
        })
      }
    },
    [currentState, updateHistory],
  )

  const moveBlock = useCallback(
    (fromIndex: number, toIndex: number) => {
      const currentPage = currentState.pages.find((page) => page.id === currentState.currentPageId)
      if (!currentPage) return

      const newBlocks = Array.from(currentPage.blocks)
      const [removed] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, removed)

      updateHistory({
        ...currentState,
        pages: currentState.pages.map((page) =>
          page.id === currentState.currentPageId ? { ...page, blocks: newBlocks } : page,
        ),
      })
    },
    [currentState, updateHistory],
  )

  const selectBlock = useCallback(
    (id: string) => {
      updateHistory({
        ...currentState,
        selectedBlockId: id,
      })
    },
    [currentState, updateHistory],
  )

  const updateBlockProperties = useCallback(
    (id: string, properties: Record<string, any>) => {
      updateHistory({
        ...currentState,
        pages: currentState.pages.map((page) =>
          page.id === currentState.currentPageId
            ? {
                ...page,
                blocks: page.blocks.map((block) =>
                  block.id === id ? { ...block, properties: { ...block.properties, ...properties } } : block,
                ),
              }
            : page,
        ),
      })
    },
    [currentState, updateHistory],
  )

  const updateSectionProperties = useCallback(
    (id: string, sectionProperties: Partial<SectionProperties>) => {
      updateHistory({
        ...currentState,
        pages: currentState.pages.map((page) =>
          page.id === currentState.currentPageId
            ? {
                ...page,
                blocks: page.blocks.map((block) =>
                  block.id === id
                    ? { ...block, sectionProperties: { ...block.sectionProperties, ...sectionProperties } }
                    : block,
                ),
              }
            : page,
        ),
      })
    },
    [currentState, updateHistory],
  )

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, history.length])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const getCurrentPage = useCallback(
    () => currentState.pages.find((page) => page.id === currentState.currentPageId) || currentState.pages[0],
    [currentState],
  )

  const getSelectedBlock = useCallback(() => {
    const currentPage = getCurrentPage()
    return currentPage.blocks.find((block) => block.id === currentState.selectedBlockId) || null
  }, [currentState, getCurrentPage])

  const replaceBlock = useCallback(
    (id: string) => {
      const currentPage = currentState.pages.find((page) => page.id === currentState.currentPageId)
      if (!currentPage) return

      const blockToReplace = currentPage.blocks.find((block) => block.id === id)
      if (!blockToReplace) return

      const blockFamily = getBlockFamily(blockToReplace.type)
      if (blockFamily.length <= 1) return

      const currentTypeIndex = blockFamily.indexOf(blockToReplace.type)
      const nextTypeIndex = (currentTypeIndex + 1) % blockFamily.length
      const newType = blockFamily[nextTypeIndex]

      const newBlock: Block = {
        ...blockToReplace,
        type: newType,
        properties: getDefaultProperties(newType),
      }

      updateHistory({
        ...currentState,
        pages: currentState.pages.map((page) =>
          page.id === currentState.currentPageId
            ? {
                ...page,
                blocks: page.blocks.map((block) => (block.id === id ? newBlock : block)),
              }
            : page,
        ),
      })
    },
    [currentState, updateHistory],
  )

  const aiEditBlock = useCallback(
    (id: string, prompt: string) => {
      // This is a placeholder implementation. In a real-world scenario,
      // you would send the prompt to an AI service and update the block
      // based on the AI's response.
      console.log(`AI editing block ${id} with prompt: ${prompt}`)
      // For demonstration purposes, we'll just append the prompt to the block's title
      updateHistory({
        ...currentState,
        pages: currentState.pages.map((page) =>
          page.id === currentState.currentPageId
            ? {
                ...page,
                blocks: page.blocks.map((block) =>
                  block.id === id
                    ? {
                        ...block,
                        properties: {
                          ...block.properties,
                          title: `${block.properties.title} (AI edited: ${prompt})`,
                        },
                      }
                    : block,
                ),
              }
            : page,
        ),
      })
    },
    [currentState, updateHistory],
  )

  return {
    pages: currentState.pages,
    currentPageId: currentState.currentPageId,
    addPage,
    switchPage,
    renamePage,
    deletePage,
    blocks: getCurrentPage().blocks,
    addBlock,
    removeBlock,
    duplicateBlock,
    moveBlock,
    selectBlock,
    updateBlockProperties,
    updateSectionProperties,
    selectedBlockId: currentState.selectedBlockId,
    getSelectedBlock,
    screenSize,
    setScreenSize,
    undo,
    redo,
    canUndo,
    canRedo,
    replaceBlock,
    aiEditBlock,
  }
}

const getDefaultProperties = (type: BlockType): Record<string, any> => {
  switch (type) {
    case "Header":
      return { title: "Logo", menuItems: ["Home", "About", "Contact"] }
    case "Hero":
      return {
        title: "Welcome to Our Website",
        subtitle: "Discover amazing features and services.",
        buttonText: "Get Started",
      }
    case "HeroImageRight":
    case "HeroImageLeft":
      return {
        title: "Welcome to Our Website",
        subtitle: "Discover amazing features and services.",
        buttonText: "Get Started",
        imageUrl: "/placeholder.svg?height=400&width=600",
      }
    case "Features":
      return {
        title: "Our Features",
        features: [
          { title: "Feature 1", description: "Description for feature 1" },
          { title: "Feature 2", description: "Description for feature 2" },
          { title: "Feature 3", description: "Description for feature 3" },
        ],
      }
    case "FeaturesGrid":
      return {
        title: "Our Features",
        features: [
          { title: "Feature 1", description: "Description for feature 1", icon: "💡" },
          { title: "Feature 2", description: "Description for feature 2", icon: "🚀" },
          { title: "Feature 3", description: "Description for feature 3", icon: "🛠️" },
          { title: "Feature 4", description: "Description for feature 4", icon: "📊" },
          { title: "Feature 5", description: "Description for feature 5", icon: "🔒" },
          { title: "Feature 6", description: "Description for feature 6", icon: "🌐" },
        ],
      }
    case "FeaturesAlternating":
      return {
        title: "Our Features",
        features: [
          {
            title: "Feature 1",
            description: "Description for feature 1",
            imageUrl: "/placeholder.svg?height=300&width=400",
          },
          {
            title: "Feature 2",
            description: "Description for feature 2",
            imageUrl: "/placeholder.svg?height=300&width=400",
          },
          {
            title: "Feature 3",
            description: "Description for feature 3",
            imageUrl: "/placeholder.svg?height=300&width=400",
          },
        ],
      }
    case "FAQs":
      return {
        title: "Frequently Asked Questions",
        faqs: [
          { question: "Question 1?", answer: "Answer to question 1." },
          { question: "Question 2?", answer: "Answer to question 2." },
          { question: "Question 3?", answer: "Answer to question 3." },
        ],
      }
    case "Footer":
      return {
        aboutText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        quickLinks: ["Home", "About", "Contact"],
        contactEmail: "info@example.com",
        contactPhone: "(123) 456-7890",
      }
    default:
      return {}
  }
}

const getDefaultSectionProperties = (): SectionProperties => ({
  backgroundColor: "#ffffff",
  paddingTop: "2rem",
  paddingBottom: "2rem",
})

const getBlockFamily = (type: BlockType): BlockType[] => {
  switch (type) {
    case "Hero":
    case "HeroImageRight":
    case "HeroImageLeft":
      return ["Hero", "HeroImageRight", "HeroImageLeft"]
    case "Features":
    case "FeaturesGrid":
    case "FeaturesAlternating":
      return ["Features", "FeaturesGrid", "FeaturesAlternating"]
    default:
      return [type]
  }
}


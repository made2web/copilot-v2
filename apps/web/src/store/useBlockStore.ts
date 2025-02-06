import { create } from "zustand"
import type { BlockType, Block, SectionProperties } from "../hooks/useCanvas"
import { usePageStore } from "./usePageStore"

interface BlockState {
  blocks: Record<string, Block[]>
  selectedBlockId: string | null
  addBlock: (type: BlockType) => void
  removeBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  updateBlockProperties: (id: string, properties: Record<string, any>) => void
  updateSectionProperties: (id: string, sectionProperties: Partial<SectionProperties>) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  selectBlock: (id: string) => void
  getSelectedBlock: () => Block | null
  replaceBlock: (id: string) => void
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
        ],
      }
    case "FAQs":
      return {
        title: "Frequently Asked Questions",
        faqs: [
          { question: "Question 1?", answer: "Answer to question 1." },
          { question: "Question 2?", answer: "Answer to question 2." },
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

export const useBlockStore = create<BlockState>((set, get) => ({
  blocks: {},
  selectedBlockId: null,
  addBlock: (type) => {
    const currentPageId = usePageStore.getState().currentPageId
    set((state) => {
      const pageBlocks = state.blocks[currentPageId] || []
      return {
        blocks: {
          ...state.blocks,
          [currentPageId]: [
            ...pageBlocks,
            {
              id: `block-${Date.now()}`,
              type,
              properties: getDefaultProperties(type),
              sectionProperties: getDefaultSectionProperties(),
            },
          ],
        },
      }
    })
  },
  removeBlock: (id) => {
    const currentPageId = usePageStore.getState().currentPageId
    set((state) => ({
      blocks: {
        ...state.blocks,
        [currentPageId]: (state.blocks[currentPageId] || []).filter((block) => block.id !== id),
      },
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
    }))
  },
  duplicateBlock: (id) => {
    const currentPageId = usePageStore.getState().currentPageId
    set((state) => {
      const pageBlocks = state.blocks[currentPageId] || []
      const blockToDuplicate = pageBlocks.find((block) => block.id === id)
      if (blockToDuplicate) {
        const newBlock: Block = {
          ...blockToDuplicate,
          id: `block-${Date.now()}`,
        }
        return {
          blocks: {
            ...state.blocks,
            [currentPageId]: [...pageBlocks, newBlock],
          },
        }
      }
      return state
    })
  },
  updateBlockProperties: (id, properties) => {
    const currentPageId = usePageStore.getState().currentPageId
    set((state) => ({
      blocks: {
        ...state.blocks,
        [currentPageId]: (state.blocks[currentPageId] || []).map((block) =>
          block.id === id ? { ...block, properties: { ...block.properties, ...properties } } : block,
        ),
      },
    }))
  },
  updateSectionProperties: (id, sectionProperties) => {
    const currentPageId = usePageStore.getState().currentPageId
    set((state) => ({
      blocks: {
        ...state.blocks,
        [currentPageId]: (state.blocks[currentPageId] || []).map((block) =>
          block.id === id
            ? { ...block, sectionProperties: { ...block.sectionProperties, ...sectionProperties } }
            : block,
        ),
      },
    }))
  },
  moveBlock: (fromIndex, toIndex) => {
    const currentPageId = usePageStore.getState().currentPageId
    set((state) => {
      const pageBlocks = state.blocks[currentPageId] || []
      const newBlocks = Array.from(pageBlocks)
      const [removed] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, removed)
      return {
        blocks: {
          ...state.blocks,
          [currentPageId]: newBlocks,
        },
      }
    })
  },
  selectBlock: (id) => set({ selectedBlockId: id }),
  getSelectedBlock: () => {
    const { blocks, selectedBlockId } = get()
    const currentPageId = usePageStore.getState().currentPageId
    const pageBlocks = blocks[currentPageId] || []
    return pageBlocks.find((block) => block.id === selectedBlockId) || null
  },
  replaceBlock: (id) => {
    const currentPageId = usePageStore.getState().currentPageId
    set((state) => {
      const pageBlocks = state.blocks[currentPageId] || []
      const blockToReplace = pageBlocks.find((block) => block.id === id)
      if (!blockToReplace) return state

      const blockFamily = getBlockFamily(blockToReplace.type)
      if (blockFamily.length <= 1) return state

      const currentTypeIndex = blockFamily.indexOf(blockToReplace.type)
      const nextTypeIndex = (currentTypeIndex + 1) % blockFamily.length
      const newType = blockFamily[nextTypeIndex]

      const newBlock: Block = {
        ...blockToReplace,
        type: newType,
        properties: getDefaultProperties(newType),
      }

      return {
        blocks: {
          ...state.blocks,
          [currentPageId]: pageBlocks.map((block) => (block.id === id ? newBlock : block)),
        },
      }
    })
  },
}))


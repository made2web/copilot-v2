import { useEffect, useCallback } from "react"
import { useHistoryStore } from "../store/useHistoryStore"

export const useKeyboardShortcuts = () => {
  const { undo, redo } = useHistoryStore()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return // Don't trigger shortcuts when typing in input fields
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modifier = isMac ? event.metaKey : event.ctrlKey

      if (modifier && event.key === "z") {
        event.preventDefault()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if (modifier && event.key === "y") {
        event.preventDefault()
        redo()
      }
    },
    [undo, redo],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])
}


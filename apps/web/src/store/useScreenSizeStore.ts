import { create } from "zustand"
import type { ScreenSize } from "../components/ResponsiveControls"

interface ScreenSizeState {
  screenSize: ScreenSize
  setScreenSize: (size: ScreenSize) => void
}

export const useScreenSizeStore = create<ScreenSizeState>((set) => ({
  screenSize: "desktop",
  setScreenSize: (size) => set({ screenSize: size }),
}))


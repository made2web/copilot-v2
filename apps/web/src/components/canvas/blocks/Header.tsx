import type React from "react"
import type { Block } from "../../hooks/useCanvas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ScreenSize } from "../ResponsiveControls"

interface HeaderProps {
  block: Block
  updateBlockProperties: (id: string, properties: Record<string, any>) => void
  screenSize: ScreenSize
}

const Header: React.FC<HeaderProps> = ({ block, updateBlockProperties, screenSize }) => {
  const { properties } = block

  const handleChange = (key: string, value: any) => {
    updateBlockProperties(block.id, { [key]: value })
  }

  const renderContent = () => (
    <header className="bg-white shadow">
      <nav
        className={`container mx-auto px-6 py-3 ${screenSize === "mobile" ? "flex-col" : "flex justify-between items-center"}`}
      >
        <div className="text-xl font-semibold">{properties.title}</div>
        <div className={`${screenSize === "mobile" ? "mt-4" : "hidden md:flex"} space-x-4`}>
          {properties.menuItems.map((item: string) => (
            <a key={item} href="#" className="text-gray-800 hover:text-gray-600">
              {item}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )

  const renderProperties = () => (
    <>
      <Label htmlFor="title">Title</Label>
      <Input id="title" value={properties.title} onChange={(e) => handleChange("title", e.target.value)} />
      <Label htmlFor="menuItems">Menu Items (comma-separated)</Label>
      <Input
        id="menuItems"
        value={properties.menuItems.join(", ")}
        onChange={(e) => handleChange("menuItems", e.target.value.split(", "))}
      />
    </>
  )

  return { renderContent, renderProperties }
}

export default Header


import type React from "react"
import type { Block } from "../../hooks/useCanvas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface HeroImageLeftProps {
  block: Block
  updateBlockProperties: (id: string, properties: Record<string, any>) => void
}

const HeroImageLeft: React.FC<HeroImageLeftProps> = ({ block, updateBlockProperties }) => {
  const { properties } = block

  const handleChange = (key: string, value: any) => {
    updateBlockProperties(block.id, { [key]: value })
  }

  const renderContent = () => (
    <div className="container mx-auto px-6 flex items-center">
      <div className="w-1/2">
        <img
          src={properties.imageUrl || "/placeholder.svg"}
          alt="Hero"
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
      <div className="w-1/2 pl-8">
        <h1 className="text-4xl font-bold mb-4">{properties.title}</h1>
        <p className="text-xl mb-8">{properties.subtitle}</p>
        <button className="bg-blue-500 text-white px-6 py-2 rounded">{properties.buttonText}</button>
      </div>
    </div>
  )

  const renderProperties = () => (
    <>
      <Label htmlFor="title">Title</Label>
      <Input id="title" value={properties.title} onChange={(e) => handleChange("title", e.target.value)} />
      <Label htmlFor="subtitle">Subtitle</Label>
      <Textarea id="subtitle" value={properties.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} />
      <Label htmlFor="buttonText">Button Text</Label>
      <Input
        id="buttonText"
        value={properties.buttonText}
        onChange={(e) => handleChange("buttonText", e.target.value)}
      />
      <Label htmlFor="imageUrl">Image URL</Label>
      <Input id="imageUrl" value={properties.imageUrl} onChange={(e) => handleChange("imageUrl", e.target.value)} />
    </>
  )

  return { renderContent, renderProperties }
}

export default HeroImageLeft


import type React from "react"
import type { Block } from "../../hooks/useCanvas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FeaturesProps {
  block: Block
  updateBlockProperties: (id: string, properties: Record<string, any>) => void
}

const Features: React.FC<FeaturesProps> = ({ block, updateBlockProperties }) => {
  const { properties } = block

  const handleChange = (key: string, value: any) => {
    updateBlockProperties(block.id, { [key]: value })
  }

  const renderContent = () => (
    <div className="container mx-auto px-6">
      <h2 className="text-3xl font-semibold mb-8">{properties.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {properties.features.map((feature: { title: string; description: string }, index: number) => (
          <div key={index} className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProperties = () => (
    <>
      <Label htmlFor="title">Title</Label>
      <Input id="title" value={properties.title} onChange={(e) => handleChange("title", e.target.value)} />
      {properties.features.map((feature: { title: string; description: string }, index: number) => (
        <div key={index}>
          <Label htmlFor={`featureTitle${index}`}>Feature {index + 1} Title</Label>
          <Input
            id={`featureTitle${index}`}
            value={feature.title}
            onChange={(e) => {
              const newFeatures = [...properties.features]
              newFeatures[index].title = e.target.value
              handleChange("features", newFeatures)
            }}
          />
          <Label htmlFor={`featureDescription${index}`}>Feature {index + 1} Description</Label>
          <Textarea
            id={`featureDescription${index}`}
            value={feature.description}
            onChange={(e) => {
              const newFeatures = [...properties.features]
              newFeatures[index].description = e.target.value
              handleChange("features", newFeatures)
            }}
          />
        </div>
      ))}
    </>
  )

  return { renderContent, renderProperties }
}

export default Features


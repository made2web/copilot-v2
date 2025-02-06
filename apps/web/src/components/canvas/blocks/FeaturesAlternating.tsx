import type React from "react"
import type { Block } from "../../hooks/useCanvas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FeaturesAlternatingProps {
  block: Block
  updateBlockProperties: (id: string, properties: Record<string, any>) => void
}

const FeaturesAlternating: React.FC<FeaturesAlternatingProps> = ({ block, updateBlockProperties }) => {
  const { properties } = block

  const handleChange = (key: string, value: any) => {
    updateBlockProperties(block.id, { [key]: value })
  }

  const renderContent = () => (
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-semibold text-center mb-12">{properties.title}</h2>
      {properties.features.map((feature: { title: string; description: string; imageUrl: string }, index: number) => (
        <div
          key={index}
          className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center mb-12`}
        >
          <div className="md:w-1/2 mb-6 md:mb-0">
            <img
              src={feature.imageUrl || "/placeholder.svg?height=300&width=400"}
              alt={feature.title}
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2 md:px-8">
            <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  )

  const renderProperties = () => (
    <>
      <Label htmlFor="title">Title</Label>
      <Input id="title" value={properties.title} onChange={(e) => handleChange("title", e.target.value)} />
      {properties.features.map((feature: { title: string; description: string; imageUrl: string }, index: number) => (
        <div key={index} className="mt-4">
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
          <Label htmlFor={`featureImageUrl${index}`}>Feature {index + 1} Image URL</Label>
          <Input
            id={`featureImageUrl${index}`}
            value={feature.imageUrl}
            onChange={(e) => {
              const newFeatures = [...properties.features]
              newFeatures[index].imageUrl = e.target.value
              handleChange("features", newFeatures)
            }}
          />
        </div>
      ))}
    </>
  )

  return { renderContent, renderProperties }
}

export default FeaturesAlternating


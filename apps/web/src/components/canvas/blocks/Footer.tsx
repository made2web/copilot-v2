import type React from "react"
import type { Block } from "../../hooks/useCanvas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FooterProps {
  block: Block
  updateBlockProperties: (id: string, properties: Record<string, any>) => void
}

const Footer: React.FC<FooterProps> = ({ block, updateBlockProperties }) => {
  const { properties } = block

  const handleChange = (key: string, value: any) => {
    updateBlockProperties(block.id, { [key]: value })
  }

  const renderContent = () => (
    <div className="container mx-auto px-6">
      <div className="flex flex-wrap justify-between">
        <div className="w-full md:w-1/4 mb-6 md:mb-0">
          <h3 className="text-lg font-semibold mb-2">About Us</h3>
          <p className="text-sm">{properties.aboutText}</p>
        </div>
        <div className="w-full md:w-1/4 mb-6 md:mb-0">
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="text-sm">
            {properties.quickLinks.map((link: string) => (
              <li key={link}>
                <a href="#" className="hover:text-gray-300">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full md:w-1/4">
          <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
          <p className="text-sm">Email: {properties.contactEmail}</p>
          <p className="text-sm">Phone: {properties.contactPhone}</p>
        </div>
      </div>
    </div>
  )

  const renderProperties = () => (
    <>
      <Label htmlFor="aboutText">About Text</Label>
      <Textarea
        id="aboutText"
        value={properties.aboutText}
        onChange={(e) => handleChange("aboutText", e.target.value)}
      />
      <Label htmlFor="quickLinks">Quick Links (comma-separated)</Label>
      <Input
        id="quickLinks"
        value={properties.quickLinks.join(", ")}
        onChange={(e) => handleChange("quickLinks", e.target.value.split(", "))}
      />
      <Label htmlFor="contactEmail">Contact Email</Label>
      <Input
        id="contactEmail"
        value={properties.contactEmail}
        onChange={(e) => handleChange("contactEmail", e.target.value)}
      />
      <Label htmlFor="contactPhone">Contact Phone</Label>
      <Input
        id="contactPhone"
        value={properties.contactPhone}
        onChange={(e) => handleChange("contactPhone", e.target.value)}
      />
    </>
  )

  return { renderContent, renderProperties }
}

export default Footer


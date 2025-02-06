import type React from "react"
import type { Block } from "../../hooks/useCanvas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FAQsProps {
  block: Block
  updateBlockProperties: (id: string, properties: Record<string, any>) => void
}

const FAQs: React.FC<FAQsProps> = ({ block, updateBlockProperties }) => {
  const { properties } = block

  const handleChange = (key: string, value: any) => {
    updateBlockProperties(block.id, { [key]: value })
  }

  const renderContent = () => (
    <div className="container mx-auto px-6">
      <h2 className="text-3xl font-semibold mb-8">{properties.title}</h2>
      <div className="space-y-4">
        {properties.faqs.map((faq: { question: string; answer: string }, index: number) => (
          <div key={index} className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProperties = () => (
    <>
      <Label htmlFor="title">Title</Label>
      <Input id="title" value={properties.title} onChange={(e) => handleChange("title", e.target.value)} />
      {properties.faqs.map((faq: { question: string; answer: string }, index: number) => (
        <div key={index}>
          <Label htmlFor={`question${index}`}>Question {index + 1}</Label>
          <Input
            id={`question${index}`}
            value={faq.question}
            onChange={(e) => {
              const newFaqs = [...properties.faqs]
              newFaqs[index].question = e.target.value
              handleChange("faqs", newFaqs)
            }}
          />
          <Label htmlFor={`answer${index}`}>Answer {index + 1}</Label>
          <Textarea
            id={`answer${index}`}
            value={faq.answer}
            onChange={(e) => {
              const newFaqs = [...properties.faqs]
              newFaqs[index].answer = e.target.value
              handleChange("faqs", newFaqs)
            }}
          />
        </div>
      ))}
    </>
  )

  return { renderContent, renderProperties }
}

export default FAQs


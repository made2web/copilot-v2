import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Block, SectionProperties } from "@/hooks/useCanvas";
import type React from "react";
import FAQs from "./blocks/FAQs";
import Features from "./blocks/Features";
import FeaturesAlternating from "./blocks/FeaturesAlternating";
import FeaturesGrid from "./blocks/FeaturesGrid";
import Footer from "./blocks/Footer";
import Header from "./blocks/Header";
import Hero from "./blocks/Hero";
import HeroImageLeft from "./blocks/HeroImageLeft";
import HeroImageRight from "./blocks/HeroImageRight";

interface PropertyEditorProps {
  block: Block;
  updateBlockProperties: (id: string, properties: Record<string, any>) => void;
  updateSectionProperties: (
    id: string,
    sectionProperties: Partial<SectionProperties>,
  ) => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({
  block,
  updateBlockProperties,
  updateSectionProperties,
}) => {
  const handleSectionChange = (key: keyof SectionProperties, value: string) => {
    updateSectionProperties(block.id, { [key]: value });
  };

  const renderSectionProperties = () => (
    <div className="mb-6">
      <h4 className="text-lg font-semibold mb-2">Section Properties</h4>
      <Label htmlFor="backgroundColor">Background Color</Label>
      <Input
        id="backgroundColor"
        type="color"
        value={block.sectionProperties.backgroundColor}
        onChange={(e) => handleSectionChange("backgroundColor", e.target.value)}
      />
      <Label htmlFor="paddingTop">Padding Top</Label>
      <Input
        id="paddingTop"
        type="text"
        value={block.sectionProperties.paddingTop}
        onChange={(e) => handleSectionChange("paddingTop", e.target.value)}
      />
      <Label htmlFor="paddingBottom">Padding Bottom</Label>
      <Input
        id="paddingBottom"
        type="text"
        value={block.sectionProperties.paddingBottom}
        onChange={(e) => handleSectionChange("paddingBottom", e.target.value)}
      />
    </div>
  );

  const renderBlockProperties = () => {
    switch (block.type) {
      case "Header":
        return Header({ block, updateBlockProperties }).renderProperties();
      case "Hero":
        return Hero({ block, updateBlockProperties }).renderProperties();
      case "HeroImageRight":
        return HeroImageRight({
          block,
          updateBlockProperties,
        }).renderProperties();
      case "HeroImageLeft":
        return HeroImageLeft({
          block,
          updateBlockProperties,
        }).renderProperties();
      case "Features":
        return Features({ block, updateBlockProperties }).renderProperties();
      case "FeaturesGrid":
        return FeaturesGrid({
          block,
          updateBlockProperties,
        }).renderProperties();
      case "FeaturesAlternating":
        return FeaturesAlternating({
          block,
          updateBlockProperties,
        }).renderProperties();
      case "FAQs":
        return FAQs({ block, updateBlockProperties }).renderProperties();
      case "Footer":
        return Footer({ block, updateBlockProperties }).renderProperties();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderSectionProperties()}
      <h3 className="text-lg font-semibold">{block.type} Properties</h3>
      {renderBlockProperties()}
    </div>
  );
};

export default PropertyEditor;

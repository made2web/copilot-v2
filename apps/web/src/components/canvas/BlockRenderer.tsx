import type { Block } from "@/hooks/useCanvas";
import { useBlockStore } from "@/store/useBlockStore";
import { useScreenSizeStore } from "@/store/useScreenSizeStore";
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

interface BlockRendererProps {
  block: Block;
  className?: string;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, className }) => {
  const { type, sectionProperties } = block;
  const { updateBlockProperties } = useBlockStore();
  const { screenSize } = useScreenSizeStore();

  const sectionStyle = {
    backgroundColor: sectionProperties?.backgroundColor || "#ffffff",
    paddingTop: sectionProperties?.paddingTop || "2rem",
    paddingBottom: sectionProperties?.paddingBottom || "2rem",
  };

  const renderContent = () => {
    if (!block.properties) {
      console.error(`Block properties are missing for block type: ${type}`);
      return null;
    }

    switch (type) {
      case "Header":
        return Header({
          block,
          updateBlockProperties,
          screenSize,
        }).renderContent();
      case "Hero":
        return Hero({
          block,
          updateBlockProperties,
          screenSize,
        }).renderContent();
      case "HeroImageRight":
        return HeroImageRight({
          block,
          updateBlockProperties,
          screenSize,
        }).renderContent();
      case "HeroImageLeft":
        return HeroImageLeft({
          block,
          updateBlockProperties,
          screenSize,
        }).renderContent();
      case "Features":
        return Features({
          block,
          updateBlockProperties,
          screenSize,
        }).renderContent();
      case "FeaturesGrid":
        return FeaturesGrid({
          block,
          updateBlockProperties,
          screenSize,
        }).renderContent();
      case "FeaturesAlternating":
        return FeaturesAlternating({
          block,
          updateBlockProperties,
          screenSize,
        }).renderContent();
      case "FAQs":
        return FAQs({
          block,
          updateBlockProperties,
          screenSize,
        }).renderContent();
      case "Footer":
        return Footer({
          block,
          updateBlockProperties,
          screenSize,
        }).renderContent();
      default:
        console.error(`Unknown block type: ${type}`);
        return null;
    }
  };

  return (
    <section style={sectionStyle} className={className}>
      {renderContent()}
    </section>
  );
};

export default BlockRenderer;

import type { Metadata } from "next";
import ImageStreamHeroDemo from "@/components/ui/image-stream-hero-demo";

export const metadata: Metadata = {
  title: "Image stream hero preview",
  description: "Responsive preview of the image stream hero component.",
};

export default function ImageStreamDemoPage() {
  return (
    <div className="min-h-screen px-4 pb-20 pt-32 md:px-8">
      <ImageStreamHeroDemo />
    </div>
  );
}

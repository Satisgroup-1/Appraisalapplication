import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const IMAGE_PARAMS = "?auto=format&fit=crop&w=1200&q=82";

const IMAGES = [
  {
    src: `https://images.unsplash.com/photo-1767739791243-af1facf4b87b${IMAGE_PARAMS}`,
    alt: "Close-up of industrial gears in a working workshop",
  },
  {
    src: `https://images.unsplash.com/photo-1754548930550-be9fa88874f4${IMAGE_PARAMS}`,
    alt: "A coder's workspace filled with screens and keyboards",
  },
  {
    src: `https://images.unsplash.com/photo-1778146476147-5f8d4bd03c79${IMAGE_PARAMS}`,
    alt: "Laptop displaying software code on a wooden desk",
  },
  {
    src: `https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5${IMAGE_PARAMS}`,
    alt: "People collaborating at computer monitors",
  },
  {
    src: `https://images.unsplash.com/photo-1504164996022-09080787b6b3${IMAGE_PARAMS}`,
    alt: "Source code displayed on a computer screen",
  },
];

export default function ImageStreamHeroDemo() {
  return (
    <ImageStreamHero
      images={IMAGES}
      className="h-[560px] w-full rounded-lg border border-border bg-background"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Your work,
            <br />
            front and centre.
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-muted-foreground">
          A hero that leads with the images instead of describing them. Swap in
          your own and the corridor rebuilds around them.
        </p>
      </div>
    </ImageStreamHero>
  );
}

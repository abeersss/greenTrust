"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable sliding image carousel (CyberAbeer Platform, migration
 * 030). Used for the up-to-4-image galleries the founder can upload
 * for tool resources (/free-tools) and books (/books). Pure CSS
 * transform transition -- no new dependency, consistent with the
 * rest of the app's hand-built interactive components.
 */
export function ImageCarousel({
  images,
  alt,
  className = "",
  heightClassName = "h-56",
}: {
  images: string[];
  alt: string;
  className?: string;
  heightClassName?: string;
}) {
  const [index, setIndex] = React.useState(0);

  if (images.length === 0) return null;

  function goTo(i: number) {
    setIndex(((i % images.length) + images.length) % images.length);
  }

  return (
    <div className={`relative overflow-hidden rounded-control bg-surface-muted ${className}`}>
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + i}
            src={src}
            alt={`${alt} ${i + 1}`}
            className={`w-full shrink-0 object-cover ${heightClassName}`}
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-text-primary shadow hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-text-primary shadow hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-primary" : "bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

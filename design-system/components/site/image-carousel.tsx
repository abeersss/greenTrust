"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/**
 * Reusable sliding image carousel (CyberAbeer Platform, migration
 * 030). Used for the up-to-4-image galleries the founder can upload
 * for tool resources (/free-tools) and books (/books). Pure CSS
 * transform transition -- no new dependency, consistent with the
 * rest of the app's hand-built interactive components. Clicking any
 * image opens a full-size lightbox (Dialog) with the same prev/next
 * controls, since the inline card view is too small to read fine
 * detail like a dashboard screenshot.
 *
 * The inline (card/hero) view navigates by dots only -- large
 * chevron buttons floating over a small card image read as heavy,
 * app-chrome-like controls that fight the card's own visual weight.
 * The dots stay lightweight and make the "tap the image to zoom"
 * affordance the primary interaction. The full-size lightbox keeps
 * chevron arrows too, since that view is a dedicated image browser
 * where larger click targets are actually useful.
 *
 * The inline (card/hero) view applies a mild *horizontal-only* zoom
 * (scale-x-110) plus a top-biased object-position on top of
 * object-cover. Two founder-upload conventions drive this:
 *
 * 1. Square screenshots with side canvas padding -- object-cover's
 *    own math already scales the image up until its width fills the
 *    wide-and-short display box (h-48/h-56/h-72), which crops the
 *    vertical excess for free but never touches the horizontal axis,
 *    so the screenshot's built-in left/right padding stayed visible
 *    as a border. scale-x-110 crops that away without an equivalent
 *    vertical zoom, which would otherwise clip real content off the
 *    top/bottom edge on top of cover's already-generous vertical crop.
 * 2. Laptop/device-mockup screenshots (bezel + screen + keyboard deck
 *    baked into one image) put the only content that matters -- the
 *    actual app screen -- in the upper portion of the canvas, with a
 *    tall mostly-empty bezel/keyboard area below it. A dead-center
 *    crop lands half the visible window on that empty lower area
 *    instead of the screen, and worse, can clip the very top of the
 *    screen (header/nav) off entirely. object-[center_41%] biases the
 *    crop window upward to line up with where the screen starts,
 *    keeping the header/nav intact for every upload; it can't fully
 *    eliminate empty space below sparse-content screenshots (a short
 *    page inside a tall mockup still leaves room), but it removes the
 *    top clipping and meaningfully trims the leftover dead space.
 *
 * The full-size lightbox intentionally keeps object-contain + no
 * zoom/position bias, since that view exists precisely to show the
 * whole, uncropped image.
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
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  if (images.length === 0) return null;

  function goTo(i: number) {
    setIndex(((i % images.length) + images.length) % images.length);
  }

  return (
    <>
      <div className={`relative overflow-hidden rounded-control bg-surface-muted ${className}`}>
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => {
                setIndex(i);
                setLightboxOpen(true);
              }}
              className="group relative w-full shrink-0 cursor-zoom-in"
              aria-label={`Zoom in on ${alt} ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} ${i + 1}`}
                className={`w-full scale-x-110 object-cover object-[center_41%] ${heightClassName}`}
              />
              <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/0 transition-colors group-hover:bg-neutral-950/20">
                <Expand
                  className="h-6 w-6 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </span>
            </button>
          ))}
        </div>

        {images.length > 1 && (
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
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-2 shadow-none">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index]}
              alt={`${alt} ${index + 1}`}
              className="max-h-[80vh] w-full rounded-control object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-text-primary shadow hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-text-primary shadow hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to image ${i + 1}`}
                      onClick={() => goTo(i)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        i === index ? "bg-primary" : "bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
 *
 * variant="book" (Books page only) swaps the flat cropped-rectangle
 * inline view for a CSS-only 3D book mockup: a tilted cover with a
 * simulated page edge and spine shadow, sitting on a soft ground
 * shadow, instead of a horizontally-stretched crop -- book covers
 * are portrait, text-heavy, and designed to be seen whole, none of
 * which suits the crop-to-fill treatment the default variant uses
 * for dashboard screenshots. The tilt direction mirrors with reading
 * direction (rtl: flips rotateY's sign and swaps which edge shows
 * the page stack vs. the spine shadow) so the book "leans" toward
 * the start of the line in both languages, the way a shelved book's
 * spine sits toward the reader's near hand. Only the tilt and the
 * decorative page/spine strips mirror -- the cover <img> itself is
 * never flipped, since that would mirror its title text. Clicking
 * the cover opens the same shared lightbox as the default variant.
 */
export function ImageCarousel({
  images,
  alt,
  className = "",
  heightClassName = "h-56",
  variant = "default",
}: {
  images: string[];
  alt: string;
  className?: string;
  heightClassName?: string;
  variant?: "default" | "book";
}) {
  const [index, setIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  if (images.length === 0) return null;

  function goTo(i: number) {
    setIndex(((i % images.length) + images.length) % images.length);
  }

  return (
    <>
      {variant === "book" ? (
        <div className={`mx-auto ${className}`}>
          <div className="[perspective:1400px]">
            <div
              className="relative aspect-[2195/2600] w-full [transform-style:preserve-3d] transition-transform duration-500 [transform:rotateY(-18deg)_rotateX(2deg)] rtl:[transform:rotateY(18deg)_rotateX(2deg)]"
            >
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Zoom in on ${alt}`}
                className="group absolute inset-0 block overflow-hidden rounded-[3px_8px_8px_3px] shadow-[0_22px_30px_-12px_rgba(15,23,42,0.45),0_2px_4px_rgba(15,23,42,0.25)] rtl:rounded-[8px_3px_3px_8px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[index]}
                  alt={`${alt} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <span
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0)_70%,rgba(0,0,0,0.12)_100%)]"
                  aria-hidden="true"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-950/0 transition-colors group-hover:bg-neutral-950/15">
                  <Expand
                    className="h-6 w-6 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </span>
              </button>

              {/* Simulated page edge -- fore-edge of the book, opposite the spine. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-7px] top-[1.5%] bottom-[1.5%] w-[9px] rounded-[0_3px_3px_0] bg-[repeating-linear-gradient(180deg,#f4f3ee_0px,#ffffff_2px,#e4e2da_3px,#ffffff_5px)] shadow-[2px_0_3px_rgba(15,23,42,0.25)] [transform-origin:left_center] [transform:rotateY(90deg)_translateZ(4.5px)] rtl:right-auto rtl:left-[-7px] rtl:rounded-[3px_0_0_3px] rtl:shadow-[-2px_0_3px_rgba(15,23,42,0.25)] rtl:[transform-origin:right_center] rtl:[transform:rotateY(-90deg)_translateZ(4.5px)]"
              />

              {/* Spine shading -- bound edge, opposite the page edge. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-[12%] bg-[linear-gradient(90deg,rgba(0,0,0,0.35),rgba(0,0,0,0))] rtl:left-auto rtl:right-0 rtl:bg-[linear-gradient(270deg,rgba(0,0,0,0.35),rgba(0,0,0,0))]"
              />
            </div>

            {/* Ground shadow */}
            <div
              aria-hidden="true"
              className="mx-auto mt-3 h-3 w-[65%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.32)_0%,rgba(15,23,42,0)_70%)]"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === index ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
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
      )}

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

/**
 * Barrel export for the CyberAbeer premium motion system.
 * Import primitives from "@/components/motion" rather than reaching
 * into individual files, so the public surface stays intentional.
 */
export { MotionProvider, useMotionContext } from "./motion-provider";
export { Reveal } from "./reveal";
export { StaggerGroup, StaggerItem } from "./stagger-group";
export { ParallaxLayer } from "./parallax-layer";
export { ScrollProgress } from "./scroll-progress";
export { PinnedStory } from "./pinned-story";
export { AnimatedConnector } from "./animated-connector";
export { CountUpMetric } from "./count-up-metric";
export { MagneticButton } from "./magnetic-button";
export { PageTransition } from "./page-transition";
export { DirectionAwareMotion } from "./direction-aware-motion";
export { ReducedMotionFallback } from "./reduced-motion-fallback";

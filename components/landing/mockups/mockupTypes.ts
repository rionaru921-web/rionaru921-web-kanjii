// Shared prop contract for the landing mockups (HeroMockup, KeishaMockup,
// ShareMockup, CoachMockup, SurveyMockup) so the demo tour can enlarge them
// and pause their looping bits without each component inventing its own API.
// All three props are optional and default to each mockup's original,
// pre-Wave-12 behavior — existing call sites (FeatureRow, Hero) are
// unaffected.
export type MockupSize = "sm" | "md" | "lg";

export interface MockupInteractionEvent {
  type: string;
  label?: string;
}

export interface MockupProps {
  size?: MockupSize;
  autoPlay?: boolean;
  onInteraction?: (event: MockupInteractionEvent) => void;
}

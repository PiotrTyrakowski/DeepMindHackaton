export type ThemeVariant = "slate" | "earthy";

export type LiveDemoState = {
  themeVariant: ThemeVariant;
  roofPhotoFixed: boolean;
  faqFirstQuestion: string;
};

export const DEFAULT_STATE: LiveDemoState = {
  themeVariant: "earthy",
  roofPhotoFixed: false,
  faqFirstQuestion: "What areas do you serve?",
};

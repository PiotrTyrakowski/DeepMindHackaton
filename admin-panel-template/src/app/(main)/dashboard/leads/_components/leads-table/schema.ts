import z from "zod";

export const scraperLeadSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  location: z.string(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  rating: z.number().nullable(),
  reviews_count: z.number().nullable(),
  google_maps_url: z.string().nullable(),
  status: z.string(),
  facebook: z.string().nullable(),
  instagram: z.string().nullable(),
  ai_summary: z.string().nullable(),
  services_detected: z.string().nullable(),
  scraped_at: z.string(),
});

export type ScraperLeadRow = z.infer<typeof scraperLeadSchema>;

export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  WAITING_FOR_CALL: {
    label: "Waiting for Call",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  CALLED: {
    label: "Called",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  BOGHT: {
    label: "Interested",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

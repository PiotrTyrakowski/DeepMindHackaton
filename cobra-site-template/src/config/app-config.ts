import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Site Cobra",
  version: packageJson.version,
  copyright: `© ${currentYear}, Site Cobra.`,
  meta: {
    title: "Site Cobra - Local Business Lead Management",
    description:
      "Site Cobra helps you discover and manage local businesses without websites, track outreach, and convert leads into web design clients.",
  },
};

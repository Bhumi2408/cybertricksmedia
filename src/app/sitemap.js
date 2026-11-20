import { SITE_URL } from "@/app/data/site";
import { CATEGORIES } from "@/app/data/serviceCategories";
import { SERVICE_PAGES } from "@/app/data/servicePages";
import { BLOGS } from "@/app/data/blogs";

/* /sitemap.xml — every public page. thank-you is left out on purpose. */
const STATIC_PAGES = [
  ["", 1, "weekly"],
  ["about-us", 0.8, "monthly"],
  ["services", 0.9, "monthly"],
  ["solutions", 0.8, "monthly"],
  ["contact-us", 0.8, "yearly"],
  ["blog", 0.7, "weekly"],
  ["gallery", 0.6, "monthly"],
  ["success-stories", 0.7, "monthly"],
  ["press-release", 0.6, "monthly"],
  ["awards-recognition", 0.6, "monthly"],
  ["award-show", 0.6, "monthly"],
  ["job-openings", 0.6, "weekly"],
  ["how-to-pay", 0.4, "yearly"],
  ["privacy-policy", 0.3, "yearly"],
  ["terms-conditions", 0.3, "yearly"],
  ["cancellation-refund-policy", 0.3, "yearly"],
  ["shipping-policy", 0.3, "yearly"],
];

export default function sitemap() {
  const now = new Date();
  const entry = (path, priority, changeFrequency) => ({
    url: path ? `${SITE_URL}/${path}` : `${SITE_URL}/`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    ...STATIC_PAGES.map(([p, pr, cf]) => entry(p, pr, cf)),
    ...Object.keys(CATEGORIES).map((s) => entry(s, 0.9, "monthly")),
    ...Object.keys(SERVICE_PAGES).map((s) => entry(s, 0.8, "monthly")),
    ...BLOGS.map((b) => entry(`blog/${b.slug}`, 0.6, "monthly")),
  ];
}

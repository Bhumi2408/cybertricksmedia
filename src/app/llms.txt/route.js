import { SITE_URL, SITE_NAME } from "@/app/data/site";
import { CATEGORIES } from "@/app/data/serviceCategories";
import { SERVICE_PAGES } from "@/app/data/servicePages";
import { BLOGS } from "@/app/data/blogs";
import { CONTACT } from "@/app/data/navigation";

/* /llms.txt — plain-text guide to the site for AI assistants / answer engines.
   Built from the same data as the pages, so new services show up automatically. */
export const dynamic = "force-static";

const name = (d) => d.eyebrow || d.title;

export function GET() {
  const lines = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(
    "> Award-winning advertising, film production and AI-powered digital marketing company based in Pitampura, Delhi, India. Trusted by 3800+ brands. Services span social media marketing, SEO / AEO / GEO, sponsored ads, film production, advertising, IT services, AI services, brand & influencer marketing, and event management & PR.",
  );
  lines.push("");
  lines.push("## Contact");
  lines.push(`- Website: ${SITE_URL}/`);
  lines.push(`- Phone: ${CONTACT.phone}`);
  lines.push(`- Email: ${CONTACT.email}`);
  lines.push(
    "- Address: 201/7, 2nd Floor, Dimension Tower, Vardhaman Market, West Enclave, Pitampura, Delhi – 110034, India",
  );
  lines.push(`- Contact page: ${SITE_URL}/contact-us`);
  lines.push("");

  lines.push("## Services");
  for (const [slug, cat] of Object.entries(CATEGORIES)) {
    lines.push(`- [${name(cat)}](${SITE_URL}/${slug})`);
    for (const [s, page] of Object.entries(SERVICE_PAGES)) {
      if (page.parent?.href === `/${slug}`) {
        lines.push(`  - [${name(page)}](${SITE_URL}/${s})`);
      }
    }
  }
  lines.push("");

  lines.push("## Company");
  lines.push(`- [About Us](${SITE_URL}/about-us)`);
  lines.push(`- [All Services](${SITE_URL}/services)`);
  lines.push(`- [Solutions](${SITE_URL}/solutions)`);
  lines.push(`- [Success Stories](${SITE_URL}/success-stories)`);
  lines.push(`- [Awards & Recognition](${SITE_URL}/awards-recognition)`);
  lines.push(`- [Award Show](${SITE_URL}/award-show)`);
  lines.push(`- [Press Release](${SITE_URL}/press-release)`);
  lines.push(`- [Gallery](${SITE_URL}/gallery)`);
  lines.push(`- [Careers](${SITE_URL}/job-openings)`);
  lines.push("");

  if (BLOGS.length) {
    lines.push("## Blog");
    for (const b of BLOGS) lines.push(`- [${b.title}](${SITE_URL}/blog/${b.slug})`);
    lines.push("");
  }

  lines.push("## Optional");
  lines.push(`- [How to Pay](${SITE_URL}/how-to-pay)`);
  lines.push(`- [Privacy Policy](${SITE_URL}/privacy-policy)`);
  lines.push(`- [Terms & Conditions](${SITE_URL}/terms-conditions)`);
  lines.push(`- [Sitemap](${SITE_URL}/sitemap.xml)`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

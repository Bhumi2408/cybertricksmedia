import HeroBanner from "@/app/components/sections/HeroBanner";
import AboutSection from "@/app/components/sections/AboutSection";
import AIDrivenSection from "@/app/components/sections/AIDrivenSection";
import ScorecardSection from "@/app/components/sections/ScorecardSection";
import ServicesSection from "@/app/components/sections/ServicesSection";
import OfferGameSection from "@/app/components/sections/OfferGameSection";
import WhyChooseSection from "@/app/components/sections/WhyChooseSection";
import BrandsSection from "@/app/components/sections/BrandsSection";
import PortfolioSection from "@/app/components/sections/PortfolioSection";
import AwardsSection from "@/app/components/sections/AwardsSection";
import TestimonialsSection from "@/app/components/sections/TestimonialsSection";
import RecognitionSection from "./components/sections/RecognitionSection";
import TechStackSection from "./components/sections/TechStackSection";
import FAQSection from "./components/sections/FAQSection";
import AwardPopup from "./components/AwardPopup";
import { HOME_FAQS } from "@/app/data/faqs";
import { SITE_URL, SITE_NAME } from "@/app/data/site";
import { CONTACT, SOCIALS } from "@/app/data/navigation";

export const metadata = {
  title: "Cybertricks Media | Best Digital Marketing Agency in India",
  description:
    "Cybertricks Media Pvt Ltd is the Best Digital Marketing Agency in India, delivering results-driven SEO, PPC, social media marketing, web solutions, and more. Contact Us Today!",
  keywords: [
    "Best Digital Marketing Agency in India",
    "Digital Marketing Company in Delhi NCR",
    "AI Digital Marketing Agency in India",
    "AI Marketing Agency in India",
    "AI Marketing Agency in Delhi",
    "Cybertricks Media",
  ],
  alternates: { canonical: `${SITE_URL}/` },
  robots: { index: true, follow: true },
};

const ORG_ID = `${SITE_URL}/#organization`;
const SAME_AS = SOCIALS.map((s) => s.href);

const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress:
    "201/7, 2nd Floor, Dimension Tower, Vardhaman Market, West Enclave, Pitampura",
  addressLocality: "Delhi",
  addressRegion: "Delhi",
  postalCode: "110034",
  addressCountry: "IN",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  alternateName: "Cybertricks Media",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Award-winning advertising, film production and AI-powered digital marketing company in India.",
  email: CONTACT.email,
  telephone: "+91-8287477783",
  address: ADDRESS,
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+91-8287477783",
      contactType: "customer service",
      email: CONTACT.email,
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  ],
  sameAs: SAME_AS,
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#localbusiness`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/logo.png`,
  logo: `${SITE_URL}/logo.png`,
  telephone: "+91-8287477783",
  email: CONTACT.email,
  address: ADDRESS,
  areaServed: "IN",
  parentOrganization: { "@id": ORG_ID },
  sameAs: SAME_AS,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function Home() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={faqSchema} />

      <AwardPopup />
      <HeroBanner />
      <AboutSection />
      <AIDrivenSection />
      <ScorecardSection />
      <ServicesSection />
      <WhyChooseSection />
      <TechStackSection />
      <OfferGameSection />
      <RecognitionSection />
      <BrandsSection />
      <PortfolioSection />
      <AwardsSection />
      <TestimonialsSection />
      <FAQSection />
    </>
  );
}

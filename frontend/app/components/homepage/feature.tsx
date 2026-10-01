import {
  CreditCard,
  FileText,
  Palette,
  Share2,
  ShoppingBag,
  Users,
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Digital Visiting Card",
    description:
      "Create an interactive digital visiting card with direct click-to-call, WhatsApp, and social buttons.",
  },
  {
    icon: ShoppingBag,
    title: "Product Catalog",
    description:
      "Showcase your products, pricing, and services with instant WhatsApp order inquiries.",
  },
  {
    icon: FileText,
    title: "Professional Resume",
    description:
      "Create, customize, and share an ATS-optimized digital resume with recruiters.",
  },
  {
    icon: Users,
    title: "Biography & Portfolio",
    description:
      "Showcase your journey, milestones, and personal brand story with curated media.",
  },
  {
    icon: Share2,
    title: "Instant QR & Link Sharing",
    description:
      "Share your profile anywhere using scannable QR codes, NFC cards, or short links.",
  },
  {
    icon: Palette,
    title: "Designer Templates",
    description:
      "Choose from premium, conversion-tested themes tailored for modern professionals.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">

          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            Features
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">
            Everything you need
          </h2>

          <p className="mt-4 text-muted">
            Build a complete digital identity and share it with your network.
          </p>

        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-line hover:shadow-xl hover:shadow-accent/40"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-ink">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  {feature.description}
                </p>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
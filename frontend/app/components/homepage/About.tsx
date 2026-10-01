import {
  CheckCircle2,
  CreditCard,
  FileText,
  Share2,
} from "lucide-react";

const items = [
  "Digital visiting card",
  "Interactive product catalog",
  "Professional resume",
  "Biography & story",
  "Business & social links",
  "Instant QR & link sharing",
];

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-white py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">

        {/* Left */}
        <div>

          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            About DigiProfilo
          </p>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            One digital identity for everything.
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted">
            Replace fragmented links and static paper cards with an all-in-one
            digital presence. DigiProfilo seamlessly connects your business cards,
            product showcases, credentials, and story into one polished, interactive
            destination.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">

            {items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <CheckCircle2
                  size={19}
                  className="shrink-0 text-primary"
                />

                <span className="text-sm font-medium text-muted">
                  {item}
                </span>
              </div>
            ))}

          </div>

        </div>

        {/* Right */}
        <div className="relative">

          <div className="grid grid-cols-2 gap-4">

            <InfoCard
              icon={<CreditCard size={24} />}
              title="Digital Card"
              description="Your professional visiting card."
            />

            <InfoCard
              icon={<FileText size={24} />}
              title="Resume"
              description="Your professional experience."
            />

            <InfoCard
              icon={<Share2 size={24} />}
              title="Share"
              description="Share with one simple link."
            />

            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-light p-6 text-white shadow-xl">
              <p className="text-4xl font-extrabold">
                1
              </p>

              <p className="mt-2 text-sm font-semibold">
                Profile
              </p>

              <p className="mt-1 text-xs text-accent">
                Everything in one place.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-page p-6">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
        {icon}
      </div>

      <h3 className="mt-5 font-bold text-ink">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted">
        {description}
      </p>

    </div>
  );
}
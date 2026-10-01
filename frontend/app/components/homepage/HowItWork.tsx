const steps = [
  {
    number: "01",
    title: "Create Account",
    description:
      "Register your account and verify your contact details.",
  },
  {
    number: "02",
    title: "Build Your Profile",
    description:
      "Add your personal information, business details, social links, services and more.",
  },
  {
    number: "03",
    title: "Share & Connect",
    description:
      "Publish instantly and share your custom link, scannable QR code, or digital card.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-page py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">

          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            How It Works
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">
            Create your profile in minutes
          </h2>

          <p className="mt-4 text-muted">
            A simple process to create and share your professional identity.
          </p>

        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">

          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-line bg-white p-7 shadow-sm"
            >

              <div className="text-5xl font-black text-accent">
                {step.number}
              </div>

              <h3 className="mt-5 text-xl font-bold text-ink">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted">
                {step.description}
              </p>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
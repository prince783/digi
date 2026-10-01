import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="px-5 pb-20 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-r from-primary via-primary to-primary-light px-6 py-16 text-center text-white sm:px-12">

        <Sparkles
          size={30}
          className="mx-auto mb-5"
        />

        <h2 className="text-3xl font-extrabold sm:text-4xl">
          Ready to build your digital identity?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-accent">
          Create your professional digital profile and make it easier
          for people to connect with you.
        </p>

        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-xl transition hover:-translate-y-1"
        >
          Get Started

          <ArrowRight size={18} />
        </Link>

      </div>

    </section>
  );
}
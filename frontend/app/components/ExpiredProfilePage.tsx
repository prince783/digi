import Link from "next/link";

export default function ExpiredProfilePage() {
  return (
    <main className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-line p-8 text-center">
        
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent flex items-center justify-center">
          <span className="text-3xl">
            ⏳
          </span>
        </div>

        <h1 className="text-2xl font-bold text-ink">
          Profile Currently Unavailable
        </h1>

        <p className="mt-3 text-muted">
          The subscription for this
          digital profile has expired.
        </p>

        <Link
          href="/"
          className="inline-flex mt-6 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary transition"
        >
          Create Your Digital Profile
        </Link>

      </div>
    </main>
  );
}
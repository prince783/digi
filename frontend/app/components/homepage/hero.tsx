import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-page">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/40 blur-3xl" />

        <div className="absolute right-[-100px] top-1/3 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />

        <div className="absolute bottom-[-100px] left-[-100px] h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div
        className="
          relative mx-auto
          grid
          min-h-[calc(100vh-80px)]
          max-w-[1500px]
          items-center
          gap-12
          px-5
          py-14
          sm:px-8
          md:py-16
          lg:grid-cols-2
          lg:gap-16
          lg:px-10
          xl:px-12
        "
      >

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}
        <div className="flex w-full flex-col justify-center">

          {/* Badge */}
          <div className="mb-6 w-fit inline-flex items-center gap-2 rounded-full border border-line bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
            <Sparkles size={16} />
            Your Digital Identity
          </div>

          {/* Heading */}
          <h1
            className="
              max-w-2xl
              text-4xl
              font-extrabold
              leading-[1.08]
              tracking-tight
              text-ink
              sm:text-5xl
              md:text-6xl
              xl:text-6xl
            "
          >
            Your professional identity,
            <br />

            <span className="bg-gradient-to-r from-primary via-primary to-primary-light bg-clip-text text-transparent">
              all in one place.
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mt-6
              max-w-xl
              text-base
              leading-7
              text-muted
              sm:text-lg
              sm:leading-8
            "
          >
            Create your digital visiting card, product catalog, professional
            resume, and online biography. Share everything with one simple link.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            {/* Login */}
            <Link
              href="/login"
              className="
                group
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-line
                bg-white
                px-6
                py-3.5
                text-sm
                font-bold
                text-ink
                shadow-sm
                transition-all
                duration-300
                hover:border-line
                hover:text-primary
                hover:shadow-md
              "
            >
              Login

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            {/* Register */}
            <Link
              href="/register"
              className="
                group
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-6
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-xl
                shadow-accent
                transition-all
                duration-300
                hover:bg-primary
                hover:shadow-line
              "
            >
              Create Your Profile

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

          </div>

          {/* Benefits */}
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted">

            <div className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              Easy to create
            </div>

            <div className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              Mobile friendly
            </div>

            <div className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              Easy to share
            </div>

          </div>

        </div>

    
{/* =====================================================
    RIGHT SIDE - VIDEO
====================================================== */}
<div className="relative w-full">

  {/* Video Glow */}
  <div className="absolute -inset-8 rounded-[45px] bg-accent/40 blur-3xl" />

  {/* Main Video Card */}
  <div
    className="
      relative
      overflow-hidden
      rounded-[30px]
      border
      border-white/80
      bg-white
      p-2.5
      shadow-[0_25px_70px_-20px_rgba(30,58,95,0.35)]
      sm:rounded-[34px]
      sm:p-3
    "
  >

    {/* Video Frame */}
    <div
      className="
        relative
        aspect-video
        w-full
        overflow-hidden
        rounded-[23px]
        bg-ink
        sm:rounded-[27px]
      "
    >

      {/* Video */}
      <video
        className="
          absolute
          inset-0
          h-full
          w-full
          object-contain
          bg-ink
        "
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source
          src="/hello.mp4"
          type="video/mp4"
        />

        Your browser does not support the video tag.
      </video>

      {/* Subtle Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-ink/5" />

      {/* Top Label */}
      <div
        className="
          absolute
          left-4
          top-4
          rounded-full
          border
          border-white/20
          bg-ink/30
          px-3.5
          py-1.5
          text-xs
          font-bold
          tracking-wider
          text-white
          backdrop-blur-md
          sm:left-4
          sm:top-2
        "
      >
        DIGITAL IDENTITY
      </div>

      {/* Bottom Information */}
      <div
        className="
          absolute
          bottom-4
          left-4
          right-4
          sm:bottom-5
          sm:left-5
          sm:right-5
        "
      >
        <div
          className="
            rounded-2xl
            border
            border-white/20
            bg-ink/30
            p-4
            backdrop-blur-lg
            sm:p-5
          "
        >
          <p className="text-sm font-bold text-white sm:text-base">
            Everything about you,
            <span className="text-line">
              {" "}in one place.
            </span>
          </p>

          <p className="mt-1 text-xs text-white/70 sm:text-sm">
            Share your professional identity anywhere.
          </p>
        </div>
      </div>

    </div>
  </div>

  {/* Decorative Shapes */}
  <div
    className="
      absolute
      -right-5
      -top-5
      h-16
      w-16
      rounded-2xl
      bg-primary/10
      blur-sm
    "
  />

  <div
    className="
      absolute
      -bottom-6
      -left-6
      h-20
      w-20
      rounded-full
      bg-primary-light/10
      blur-md
    "
  />

</div>



      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ProductType = "catalog" | "card" | "resume";

interface PaymentSuccessOverlayProps {
  productType: ProductType;
  customerName?: string;
  productUrl?: string;
  onClose: () => void;
  /** seconds before auto-close, default = 6 */
  autoCloseSeconds?: number;
}

/* =========================================================
   CONFETTI PARTICLE
========================================================= */

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "square" | "circle" | "strip";
}

const CONFETTI_COLORS = [
  "#FF6B6B",
  "#FFA500",
  "#FFD700",
  "#7CFC00",
  "#00CED1",
  "#1E90FF",
  "#9370DB",
  "#FF69B4",
  "#00FA9A",
  "#FF4500",
  "#FF1493",
  "#00BFFF",
  "#ADFF2F",
  "#FF8C00",
  "#DA70D6",
];

function createParticle(id: number): Particle {
  const angle = (Math.random() * Math.PI * 2);
  const speed = 4 + Math.random() * 8;
  return {
    id,
    x: 50 + (Math.random() - 0.5) * 20, // % from left, centered
    y: 40 + (Math.random() - 0.5) * 10, // % from top, centered
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 10,
    velocityX: Math.cos(angle) * speed,
    velocityY: -(5 + Math.random() * 12), // burst upward
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    opacity: 1,
    shape: Math.random() > 0.6 ? "circle" : Math.random() > 0.5 ? "strip" : "square",
  };
}

/* =========================================================
   PRODUCT LABELS
========================================================= */

function getProductLabel(type: ProductType) {
  switch (type) {
    case "catalog":
      return { noun: "Catalog", action: "View Catalog", emoji: "🛍️" };
    case "card":
      return { noun: "Digital Card", action: "View Card", emoji: "💳" };
    case "resume":
      return { noun: "Resume", action: "View Resume", emoji: "📄" };
  }
}

/* =========================================================
   CANVAS CONFETTI
========================================================= */

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to window
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create burst of particles
    const particles: Particle[] = [];
    for (let i = 0; i < 180; i++) {
      particles.push(createParticle(i));
    }
    particlesRef.current = particles;

    let running = true;
    const gravity = 0.25;
    const drag = 0.98;

    function draw() {
      if (!running) return;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      particlesRef.current = particlesRef.current.filter(
        (p) => p.opacity > 0.02
      );

      for (const p of particlesRef.current) {
        ctx!.save();
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;

        const px = (p.x / 100) * canvas!.width;
        const py = (p.y / 100) * canvas!.height;

        ctx!.translate(px, py);
        ctx!.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === "circle") {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
        } else if (p.shape === "strip") {
          ctx!.fillRect(-p.size / 2, -p.size / 6, p.size, p.size / 3);
        } else {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx!.restore();

        // Physics
        p.velocityY += gravity;
        p.velocityX *= drag;
        p.velocityY *= drag;
        p.x += (p.velocityX / canvas!.width) * 100;
        p.y += (p.velocityY / canvas!.height) * 100;
        p.rotation += p.rotationSpeed;
        // fade out when falling
        if (p.velocityY > 0) {
          p.opacity -= 0.006;
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ mixBlendMode: "normal" }}
    />
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PaymentSuccessOverlay({
  productType,
  customerName,
  productUrl,
  onClose,
  autoCloseSeconds = 6,
}: PaymentSuccessOverlayProps) {
  const [countdown, setCountdown] = useState(autoCloseSeconds);
  const [visible, setVisible] = useState(false);
  const { noun, action, emoji } = getProductLabel(productType);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Countdown + auto-close
  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // let fade-out finish
  };

  const progressPct = ((autoCloseSeconds - countdown) / autoCloseSeconds) * 100;

  return (
    <>
      {/* Confetti canvas — renders above everything */}
      <ConfettiCanvas />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        onClick={handleClose}
      >
        {/* Card */}
        <div
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          style={{
            transform: visible ? "scale(1) translateY(0)" : "scale(0.88) translateY(40px)",
            opacity: visible ? 1 : 0,
            transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Top gradient strip */}
          <div className="bg-gradient-to-br from-[#1E3A5F] via-[#1a6b4a] to-[#0f4c35] px-8 pt-10 pb-8 text-white">
            {/* Animated emoji blast */}
            <div className="mb-4 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl shadow-inner"
                style={{
                  animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
                }}
              >
                🎉
              </div>
            </div>

            <div
              style={{
                animation: "fadeSlideUp 0.5s ease 0.15s both",
              }}
            >
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                Payment Successful
              </p>
              <h1 className="mt-1 text-center text-2xl font-black tracking-tight">
                Congratulations
                {customerName ? `, ${customerName.split(" ")[0]}` : ""}!
              </h1>
              <p className="mt-2 text-center text-sm text-white/80">
                Your {noun} is now{" "}
                <span className="font-bold text-green-300">live</span>{" "}
                {emoji}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            {/* Celebration message */}
            <div
              className="rounded-2xl border border-green-100 bg-green-50 p-4"
              style={{ animation: "fadeSlideUp 0.5s ease 0.3s both" }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-green-500" size={20} />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Payment verified &amp; receipt sent!
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-green-700">
                    Your invoice PDF has been emailed to your registered address.
                    Your {noun.toLowerCase()} is publicly accessible right now.
                  </p>
                </div>
              </div>
            </div>

            {/* Thank you message */}
            <p
              className="mt-4 text-center text-sm leading-6 text-gray-500"
              style={{ animation: "fadeSlideUp 0.5s ease 0.45s both" }}
            >
              Thank you for choosing{" "}
              <span className="font-semibold text-[#1E3A5F]">DigiProfilo</span>.
              We&apos;re excited to help you grow your business online! 🚀
            </p>

            {/* CTA buttons */}
            <div
              className="mt-6 flex flex-col gap-2"
              style={{ animation: "fadeSlideUp 0.5s ease 0.55s both" }}
            >
              {productUrl && (
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#1a6b4a] text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.98]"
                >
                  <ExternalLink size={16} />
                  {action}
                </a>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
              >
                <ArrowRight size={16} />
                Continue to Dashboard
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
                  {countdown}s
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes bounceIn {
          0%   { transform: scale(0.3); opacity: 0; }
          50%  { transform: scale(1.12); opacity: 1; }
          70%  { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

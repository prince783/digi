"use client";

import type { ChangeEvent } from "react";
import { ArrowLeft, Check, Edit3, ImagePlus, Plus, Trash2 } from "lucide-react";
import type { HeroContent, HeroErrors } from "../catalog-editor.types";
import { HERO_IMAGE_UPLOAD_TEMPLATES } from "../editor/config/constants";

export default function HeroStep({
  layoutTemplateId,
  hero,
  errors,
  updateHero,
  handleHeroImage,
  onRemoveSlide,
  onToggleSlideActive,
  onMoveSlide,
}: {
  layoutTemplateId: string;
  hero: HeroContent;
  errors: HeroErrors;
  updateHero: (field: keyof HeroContent, value: string) => void;
  handleHeroImage: (
    event: ChangeEvent<HTMLInputElement>,
    targetSlideId?: string,
  ) => void;
  onRemoveSlide: (slideId: string) => void;
  onToggleSlideActive: (slideId: string) => void;
  onMoveSlide: (slideId: string, direction: -1 | 1) => void;
}) {
  const supportsHeroImageUpload = HERO_IMAGE_UPLOAD_TEMPLATES.has(layoutTemplateId);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-page p-4">
        <div className="grid gap-4 sm:grid-cols-2">

          {supportsHeroImageUpload && (
            <div className="sm:col-span-2">
              <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-page">
                    <ImagePlus size={20} className="text-ink" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Hero Slider</p>
                    <p className="mt-0.5 text-xs text-muted">
                      Manage the images shown at the top of your catalog.
                    </p>
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs text-muted">
                  <li className="flex items-center gap-1.5">
                    <Check size={13} className="shrink-0 text-success" />
                    These images display as a slider on your public catalog.
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={13} className="shrink-0 text-success" />
                    Recommended size: 16:9 (e.g. 1920 × 1080px).
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={13} className="shrink-0 text-success" />
                    You can add multiple slides and reorder them.
                  </li>
                </ul>

                <div className="shrink-0 rounded-xl border border-line bg-page px-3 py-2 text-center">
                  <p className="text-xs font-bold text-ink">16:9 Recommended</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    JPG, PNG (Max 5MB each)
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-ink">
                  Slider Images ({hero.images.length}/10)
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Add, edit and manage your catalog banner images. Use the
                  arrows to reorder the slides.
                </p>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {hero.images.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="overflow-hidden rounded-xl border border-line bg-white"
                  >
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => onMoveSlide(slide.id, -1)}
                          disabled={index === 0}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted transition hover:bg-page disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowLeft size={12} className="rotate-90" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveSlide(slide.id, 1)}
                          disabled={index === hero.images.length - 1}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted transition hover:bg-page disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowLeft size={12} className="-rotate-90" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
                          {slide.active ? "Active" : "Hidden"}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleSlideActive(slide.id)}
                          className={`relative h-5 w-9 rounded-full transition ${
                            slide.active ? "bg-success" : "bg-line"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                              slide.active ? "left-[18px]" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="aspect-video w-full bg-page">
                      <img
                        src={slide.image}
                        alt={`Slide ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between px-3 pt-2 text-[11px] text-muted">
                      <span>1920 × 1080 (16:9)</span>
                      <span>
                        {Math.round(((slide.image.length * 3) / 4) / 1024)} KB
                      </span>
                    </div>

                    <div className="flex gap-2 p-3">
                      <label className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line text-xs font-bold text-ink transition hover:bg-page">
                        <Edit3 size={13} />
                        Edit
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleHeroImage(event, slide.id)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => onRemoveSlide(slide.id)}
                        className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 text-xs font-bold text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {hero.images.length < 10 && (
                  <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-white text-center transition hover:border-muted hover:bg-page">
                    <Plus size={18} className="text-success" />
                    <span className="text-xs font-bold text-ink">
                      Add New Slide
                    </span>
                    <span className="text-[11px] text-muted">
                      Upload a new banner image (16:9) · JPG, PNG (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleHeroImage(event)}
                    />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

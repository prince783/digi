import type { ChangeEvent } from "react";
import type { HeroContent } from "../../catalog-editor.types";

export function createCatalogHeroActions (state: ReturnType<typeof import("../hooks/useCatalogEditorState")["useCatalogEditorState"]>) {
  const {
    hero,
    setHasChanges,
    setHero,
    setHeroCropImage,
    setHeroCropTargetId,
    setSuccessToast
  } = state;

function handleHeroImage(
    event: ChangeEvent<HTMLInputElement>,
    targetSlideId?: string,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Hero image should be less than 5MB.");
      event.target.value = "";
      return;
    }

    if (!targetSlideId && hero.images.length >= 10) {
      alert("You can add up to 10 slides.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setHeroCropTargetId(targetSlideId ?? null);
        setHeroCropImage(reader.result);
      }
    };

    reader.onerror = () => {
      alert("Unable to read this hero image.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

function addHeroSlide(croppedImage: string) {
    setHasChanges(true);
    setHero((current) => ({
      ...current,
      images: [
        ...current.images,
        {
          id: `slide_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          image: croppedImage,
          active: true,
        },
      ],
    }));
    setSuccessToast("Image uploaded successfully.");
  }

function replaceHeroSlideImage(slideId: string, croppedImage: string) {
    setHasChanges(true);
    setHero((current) => ({
      ...current,
      images: current.images.map((slide) =>
        slide.id === slideId ? { ...slide, image: croppedImage } : slide,
      ),
    }));
    setSuccessToast("Image uploaded successfully.");
  }

function removeHeroSlide(slideId: string) {
    setHasChanges(true);
    setHero((current) => ({
      ...current,
      images: current.images.filter((slide) => slide.id !== slideId),
    }));
    setSuccessToast("Image removed successfully.");
  }

function toggleHeroSlideActive(slideId: string) {
    setHasChanges(true);
    setHero((current) => ({
      ...current,
      images: current.images.map((slide) =>
        slide.id === slideId ? { ...slide, active: !slide.active } : slide,
      ),
    }));
  }

function moveHeroSlide(slideId: string, direction: -1 | 1) {
    setHasChanges(true);
    setHero((current) => {
      const index = current.images.findIndex((slide) => slide.id === slideId);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= current.images.length) {
        return current;
      }
      const images = [...current.images];
      [images[index], images[targetIndex]] = [images[targetIndex], images[index]];
      return { ...current, images };
    });
  }

  return { handleHeroImage, addHeroSlide, replaceHeroSlideImage, removeHeroSlide, toggleHeroSlideActive, moveHeroSlide };
}

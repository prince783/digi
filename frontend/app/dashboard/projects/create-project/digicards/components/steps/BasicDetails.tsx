"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useDigitalCard } from "../DigitalCardEditor";

export default function BasicDetails() {
  const { card, updateCard } = useDigitalCard();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [uploading, setUploading] =
    useState(false);

  /* =====================================================
     PROFILE PHOTO UPLOAD
     
     IMPORTANT:
     This only updates profilePhoto in the context.
     It does NOT create a DigitalCard.
     
     DigitalCard should be created only when the user
     enters username in the final step.
  ===================================================== */

  const handlePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    /*
     * Reset input so the same image can be selected again.
     */
    e.target.value = "";

    /*
     * Maximum 2MB.
     */
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      return;
    }

    /*
     * Allowed image formats.
     */
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please upload a JPG, PNG or WEBP image."
      );
      return;
    }

    try {
      setUploading(true);

      /* =================================================
         STEP 1
         GET CLOUDINARY SIGNATURE
      ================================================= */

      const signatureResponse =
        await fetch(
          "/api/digital-cards/cloudinary-signature",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const signatureData =
        await signatureResponse.json();

      if (!signatureResponse.ok) {
        throw new Error(
          signatureData?.error ||
            signatureData?.message ||
            "Failed to generate Cloudinary signature."
        );
      }

      if (
        !signatureData?.cloudName ||
        !signatureData?.apiKey ||
        !signatureData?.timestamp ||
        !signatureData?.signature ||
        !signatureData?.folder
      ) {
        throw new Error(
          "Invalid Cloudinary signature response."
        );
      }

      /* =================================================
         STEP 2
         CREATE CLOUDINARY FORM DATA
      ================================================= */

      const formData = new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "api_key",
        signatureData.apiKey
      );

      formData.append(
        "timestamp",
        String(
          signatureData.timestamp
        )
      );

      formData.append(
        "signature",
        signatureData.signature
      );

      formData.append(
        "folder",
        signatureData.folder
      );

      /* =================================================
         STEP 3
         UPLOAD TO CLOUDINARY
      ================================================= */

      const uploadResponse =
        await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

      const uploadData =
        await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData?.error?.message ||
            "Cloudinary image upload failed."
        );
      }

      /* =================================================
         STEP 4
         VALIDATE CLOUDINARY RESPONSE
      ================================================= */

      const secureUrl =
        typeof uploadData?.secure_url ===
        "string"
          ? uploadData.secure_url.trim()
          : "";

      if (!secureUrl) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      /*
       * =================================================
       * IMPORTANT
       *
       * Only update React/context state here.
       *
       * If cardId does not exist yet, your
       * DigitalCardProvider will NOT send PATCH.
       *
       * Therefore:
       *
       * Basic Details
       *      ↓
       * Local state
       *      ↓
       * No MongoDB card creation
       * =================================================
       */

      await updateCard(
        "profilePhoto",
        secureUrl
      );

      console.log(
        "Profile photo uploaded successfully:",
        secureUrl
      );
    } catch (error) {
      console.error(
        "PROFILE PHOTO UPLOAD ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload profile photo."
      );
    } finally {
      setUploading(false);
    }
  };

  /* =====================================================
     OPEN FILE SELECTOR
  ===================================================== */

  const openFileSelector = () => {
    if (uploading) return;

    fileInputRef.current?.click();
  };

  return (
    <div>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-7">
        <h1 className="text-lg font-semibold leading-[24px] text-[#121212]">
          Step 1 - Basic Details
        </h1>

        <p className="mt-[5px] text-[12px] leading-[17px] text-[#77736E]">
          Add your basic information which will
          be shown on your card.
        </p>
      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="space-y-[18px]">
        {/* =================================================
            TOP SECTION
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,1fr)_160px]">
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="order-2 space-y-[18px] sm:order-1">
            {/* FULL NAME */}

            <Input
              label="Full Name"
              required
              value={card.fullName}
              onChange={(value) =>
                updateCard(
                  "fullName",
                  value
                )
              }
              placeholder="Enter full name"
            />

            {/* COMPANY NAME */}

            <Input
              label="Company Name"
              required
              value={card.companyName}
              onChange={(value) =>
                updateCard(
                  "companyName",
                  value
                )
              }
              placeholder="Enter company name"
            />

            {/* DESIGNATION */}

            <Input
              label="Designation"
              required
              value={card.designation}
              onChange={(value) =>
                updateCard(
                  "designation",
                  value
                )
              }
              placeholder="Founder & CEO"
            />
          </div>

          {/* =================================================
              RIGHT SIDE
              PROFILE PHOTO
          ================================================= */}

          <div className="order-1 sm:order-2">
            <label className="block text-[12px] font-medium text-[#121212]">
              Profile Photo{" "}
              <span className="text-[#e63946]">
                *
              </span>
            </label>

            {/* PHOTO BOX */}

            <div className="mt-[7px] flex justify-start">
              <div className="relative flex h-[130px] w-[130px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E0D9] bg-white">
                {/* PROFILE IMAGE */}

                <div className="h-[98px] w-[98px] overflow-hidden rounded-full bg-[#f1d6c0]">
                  {card.profilePhoto ? (
                    <img
                      src={
                        card.profilePhoto
                      }
                      alt="Profile photo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      👤
                    </div>
                  )}
                </div>

                {/* CAMERA BUTTON */}

                <button
                  type="button"
                  disabled={uploading}
                  onClick={
                    openFileSelector
                  }
                  className="absolute bottom-[4px] right-[3px] flex h-[28px] w-[28px] items-center justify-center rounded-full border border-white bg-white shadow-sm transition hover:bg-[#EAF0F6] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Change profile photo"
                >
                  {uploading ? (
                    <Loader2
                      size={14}
                      strokeWidth={2}
                      className="animate-spin text-[#1E3A5F]"
                    />
                  ) : (
                    <Camera
                      size={14}
                      strokeWidth={2}
                      className="text-[#121212]"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* =================================================
                HIDDEN FILE INPUT
            ================================================= */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handlePhotoChange
              }
              className="hidden"
              disabled={uploading}
            />

            {/* =================================================
                CHANGE PHOTO
            ================================================= */}

            <button
              type="button"
              disabled={uploading}
              onClick={
                openFileSelector
              }
              className="mt-[6px] block text-[12px] font-medium text-[#1E3A5F] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : "Change Photo"}
            </button>

            {/* HELP TEXT */}

            <p className="mt-[2px] text-[10px] leading-[13px] text-[#77736E]">
              JPG, PNG or WEBP.
              <br />
              Max size 2MB
            </p>
          </div>
        </div>

        {/* =================================================
            TAGLINE
        ================================================= */}

        <Input
          label="Tagline"
          required
          value={card.tagline}
          onChange={(value) =>
            updateCard(
              "tagline",
              value
            )
          }
          placeholder="Empowering Brands with Digital Solutions"
        />

        {/* =================================================
            ABOUT COMPANY
        ================================================= */}

        <div>
          <label className="block text-[12px] font-medium text-[#121212]">
            About Company{" "}
            <span className="text-[#e63946]">
              *
            </span>
          </label>

          <textarea
            rows={4}
            maxLength={500}
            value={
              card.aboutCompany
            }
            onChange={(e) =>
              updateCard(
                "aboutCompany",
                e.target.value
              )
            }
            placeholder="Write about your company..."
            className="mt-[7px] w-full resize-none rounded-[5px] border border-[#E5E0D9] bg-white px-[12px] py-[10px] text-[12px] leading-[17px] text-[#121212] outline-none transition placeholder:text-[#77736E] focus:border-[#1E3A5F] focus:ring-[2px] focus:ring-[#1E3A5F]/10"
          />

          {/* CHARACTER COUNT */}

          <div className="mt-[3px] flex justify-end">
            <span className="text-[10px] text-[#77736E]">
              {card.aboutCompany?.length ||
                0}{" "}
              / 500
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

function Input({
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#121212]">
        {label}

        {required && (
          <span className="ml-1 text-[#e63946]">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="mt-[7px] h-[38px] w-full rounded-[5px] border border-[#E5E0D9] bg-white px-[12px] text-[12px] text-[#121212] outline-none transition placeholder:text-[#77736E] focus:border-[#1E3A5F] focus:ring-[2px] focus:ring-[#1E3A5F]/10"
      />
    </div>
  );
}
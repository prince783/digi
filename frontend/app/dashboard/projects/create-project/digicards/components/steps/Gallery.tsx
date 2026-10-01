"use client";

import { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  X,
  Play,
  Trash2,
  FileText,
  Upload,
} from "lucide-react";

import { useDigitalCard } from "../DigitalCardEditor";

/* =========================================================
   TYPES
========================================================= */

interface GalleryImage {
  url: string;
  name?: string;
}

interface GalleryVideo {
  id: string;
  url: string;
  platform: "youtube" | "vimeo";
}

interface Certificate {
  id: string;
  name: string;
  size: number;
  url: string;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Gallery() {
  const { card, updateCard } = useDigitalCard();

  const imageInputRef =
    useRef<HTMLInputElement>(null);

  const certificateInputRef =
    useRef<HTMLInputElement>(null);

  const [videos, setVideos] =
    useState<GalleryVideo[]>(
      card.videos ?? []
    );

  const [certificates, setCertificates] =
    useState<Certificate[]>(
      card.certificates ?? []
    );

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [uploadingCertificates, setUploadingCertificates] =
    useState(false);

  /* =========================================================
     CLOUDINARY IMAGE UPLOAD
  ========================================================= */

  const uploadImageToCloudinary = async (
    file: File
  ): Promise<string> => {
    /*
     * Validate file type
     */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Only JPG, PNG and WEBP images are allowed."
      );
    }

    /*
     * Maximum 5MB per gallery image
     */

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(
        `"${file.name}" is larger than 5MB.`
      );
    }

    /* =====================================================
       STEP 1
       GET CLOUDINARY SIGNATURE
    ===================================================== */

    console.log(
      "Getting Cloudinary signature for:",
      file.name
    );

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

    console.log(
      "CLOUDINARY SIGNATURE RESPONSE:",
      signatureResponse.status,
      signatureData
    );

    if (!signatureResponse.ok) {
      throw new Error(
        signatureData.message ||
          "Failed to generate Cloudinary signature."
      );
    }

    const {
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    } = signatureData;

    if (
      !signature ||
      !timestamp ||
      !cloudName ||
      !apiKey
    ) {
      throw new Error(
        "Invalid Cloudinary signature response."
      );
    }

    /* =====================================================
       STEP 2
       CREATE CLOUDINARY FORM DATA
    ===================================================== */

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "api_key",
      apiKey
    );

    formData.append(
      "timestamp",
      String(timestamp)
    );

    formData.append(
      "signature",
      signature
    );

    /*
     * Folder returned by server
     */

    if (folder) {
      formData.append(
        "folder",
        folder
      );
    }

    /* =====================================================
       STEP 3
       DIRECT UPLOAD TO CLOUDINARY
    ===================================================== */

    const cloudinaryUrl =
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    console.log(
      "Uploading gallery image to Cloudinary:",
      cloudinaryUrl
    );

    const uploadResponse =
      await fetch(
        cloudinaryUrl,
        {
          method: "POST",
          body: formData,
        }
      );

    const uploadData =
      await uploadResponse.json();

    console.log(
      "CLOUDINARY GALLERY UPLOAD RESPONSE:",
      uploadResponse.status,
      uploadData
    );

    if (!uploadResponse.ok) {
      throw new Error(
        uploadData.error?.message ||
          "Cloudinary image upload failed."
      );
    }

    /* =====================================================
       STEP 4
       GET CLOUDINARY URL
    ===================================================== */

    if (
      !uploadData.secure_url
    ) {
      throw new Error(
        "Cloudinary did not return secure_url."
      );
    }

    console.log(
      "GALLERY CLOUDINARY URL:",
      uploadData.secure_url
    );

    console.log(
      "GALLERY CLOUDINARY PUBLIC ID:",
      uploadData.public_id
    );

    return uploadData.secure_url;
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    try {
      setUploadingImages(true);

      /* ===================================================
         CURRENT GALLERY
      =================================================== */

      const currentImages: GalleryImage[] =
        card.gallery ?? [];

      /* ===================================================
         MAX 12 IMAGES
      =================================================== */

      const remainingSlots =
        12 - currentImages.length;

      if (remainingSlots <= 0) {
        alert(
          "You can upload up to 12 images."
        );

        return;
      }

      /* ===================================================
         FILTER IMAGE FILES
      =================================================== */

      const selectedFiles =
        files
          .filter((file) =>
            [
              "image/jpeg",
              "image/png",
              "image/webp",
            ].includes(file.type)
          )
          .slice(
            0,
            remainingSlots
          );

      if (!selectedFiles.length) {
        alert(
          "Please select JPG, PNG or WEBP images."
        );

        return;
      }

      /* ===================================================
         UPLOAD ONE BY ONE
      =================================================== */

      const uploadedImages: GalleryImage[] =
        [];

      for (
        const file of selectedFiles
      ) {
        console.log(
          "===================================="
        );

        console.log(
          "GALLERY IMAGE:",
          file.name
        );

        console.log(
          "SIZE:",
          file.size
        );

        console.log(
          "TYPE:",
          file.type
        );

        try {
          const cloudinaryUrl =
            await uploadImageToCloudinary(
              file
            );

          uploadedImages.push({
            url: cloudinaryUrl,
            name: file.name,
          });

          console.log(
            "GALLERY IMAGE SUCCESS:",
            cloudinaryUrl
          );
        } catch (error) {
          console.error(
            `Failed to upload ${file.name}:`,
            error
          );

          alert(
            error instanceof Error
              ? `${file.name}: ${error.message}`
              : `Failed to upload ${file.name}`
          );
        }
      }

      /* ===================================================
         NOTHING UPLOADED
      =================================================== */

      if (
        uploadedImages.length === 0
      ) {
        return;
      }

      /* ===================================================
         UPDATE GALLERY
      =================================================== */

      const updatedGallery =
        [
          ...currentImages,
          ...uploadedImages,
        ];

      console.log(
        "FINAL GALLERY:",
        updatedGallery
      );

      /* ===================================================
         SAVE TO MONGODB
      =================================================== */

      await updateCard(
        "gallery",
        updatedGallery
      );

      console.log(
        "GALLERY SAVED TO MONGODB:"
      );

      console.log(
        updatedGallery
      );
    } catch (error) {
      console.error(
        "GALLERY UPLOAD ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload gallery images."
      );
    } finally {
      setUploadingImages(false);

      event.target.value = "";
    }
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = async (
    index: number
  ) => {
    const updatedGallery =
      [
        ...(card.gallery ?? []),
      ];

    updatedGallery.splice(
      index,
      1
    );

    await updateCard(
      "gallery",
      updatedGallery
    );
  };

  /* =========================================================
     ADD VIDEO
  ========================================================= */

  const addVideo = async () => {
    const newVideo: GalleryVideo = {
      id: crypto.randomUUID(),
      url: "",
      platform: "youtube",
    };

    const updatedVideos = [
      ...videos,
      newVideo,
    ];

    setVideos(
      updatedVideos
    );

    await updateCard(
      "videos",
      updatedVideos
    );
  };

  /* =========================================================
     DETECT VIDEO PLATFORM
  ========================================================= */

  const detectPlatform = (
    url: string
  ): "youtube" | "vimeo" => {
    const lowerUrl =
      url.toLowerCase();

    if (
      lowerUrl.includes(
        "vimeo.com"
      )
    ) {
      return "vimeo";
    }

    return "youtube";
  };

  /* =========================================================
     UPDATE VIDEO
  ========================================================= */

  const updateVideo = async (
    id: string,
    url: string
  ) => {
    const updatedVideos =
      videos.map(
        (video) =>
          video.id === id
            ? {
                ...video,
                url,
                platform:
                  detectPlatform(
                    url
                  ),
              }
            : video
      );

    setVideos(
      updatedVideos
    );

    await updateCard(
      "videos",
      updatedVideos
    );
  };

  /* =========================================================
     REMOVE VIDEO
  ========================================================= */

  const removeVideo = async (
    id: string
  ) => {
    const updatedVideos =
      videos.filter(
        (video) =>
          video.id !== id
      );

    setVideos(
      updatedVideos
    );

    await updateCard(
      "videos",
      updatedVideos
    );
  };

  /* =========================================================
     CERTIFICATE UPLOAD
  ========================================================= */

  const uploadCertificateToCloudinary =
    async (
      file: File
    ): Promise<string> => {
      if (
        file.type !==
        "application/pdf"
      ) {
        throw new Error(
          "Only PDF certificates are allowed."
        );
      }

      /*
       * Maximum 10MB
       */

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        throw new Error(
          `"${file.name}" is larger than 10MB.`
        );
      }

      /* ===================================================
         SIGNATURE
      =================================================== */

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

      if (
        !signatureResponse.ok
      ) {
        throw new Error(
          signatureData.message ||
            "Failed to generate Cloudinary signature."
        );
      }

      const {
        signature,
        timestamp,
        cloudName,
        apiKey,
        folder,
      } = signatureData;

      if (
        !signature ||
        !timestamp ||
        !cloudName ||
        !apiKey
      ) {
        throw new Error(
          "Invalid Cloudinary signature response."
        );
      }

      /* ===================================================
         CLOUDINARY PDF UPLOAD
      =================================================== */

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "api_key",
        apiKey
      );

      formData.append(
        "timestamp",
        String(timestamp)
      );

      formData.append(
        "signature",
        signature
      );

      if (folder) {
        formData.append(
          "folder",
          folder
        );
      }

      const uploadUrl =
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

      const response =
        await fetch(
          uploadUrl,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      console.log(
        "CLOUDINARY CERTIFICATE RESPONSE:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            "Certificate upload failed."
        );
      }

      if (
        !data.secure_url
      ) {
        throw new Error(
          "Cloudinary did not return certificate URL."
        );
      }

      return data.secure_url;
    };

  /* =========================================================
     CERTIFICATE UPLOAD
  ========================================================= */

  const handleCertificateUpload =
    async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const files =
        Array.from(
          event.target.files || []
        );

      if (!files.length) {
        return;
      }

      try {
        setUploadingCertificates(
          true
        );

        const currentCertificates =
          card.certificates ?? [];

        const uploadedCertificates: Certificate[] =
          [];

        for (
          const file of files
        ) {
          try {
            const url =
              await uploadCertificateToCloudinary(
                file
              );

            uploadedCertificates.push(
              {
                id: crypto.randomUUID(),
                name: file.name,
                size: file.size,
                url,
              }
            );
          } catch (error) {
            console.error(
              "CERTIFICATE UPLOAD ERROR:",
              error
            );

            alert(
              error instanceof Error
                ? `${file.name}: ${error.message}`
                : `Failed to upload ${file.name}`
            );
          }
        }

        if (
          uploadedCertificates.length ===
          0
        ) {
          return;
        }

        const updatedCertificates =
          [
            ...currentCertificates,
            ...uploadedCertificates,
          ];

        setCertificates(
          updatedCertificates
        );

        await updateCard(
          "certificates",
          updatedCertificates
        );
      } catch (error) {
        console.error(
          "CERTIFICATE ERROR:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Failed to upload certificate."
        );
      } finally {
        setUploadingCertificates(
          false
        );

        event.target.value = "";
      }
    };

  /* =========================================================
     REMOVE CERTIFICATE
  ========================================================= */

  const removeCertificate = async (
    id: string
  ) => {
    const updatedCertificates =
      certificates.filter(
        (certificate) =>
          certificate.id !== id
      );

    setCertificates(
      updatedCertificates
    );

    await updateCard(
      "certificates",
      updatedCertificates
    );
  };

  /* =========================================================
     FILE SIZE
  ========================================================= */

  const formatFileSize = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="w-full space-y-8">

      {/* =====================================================
          TITLE
      ===================================================== */}

      <div>
        <h2 className="text-sm font-semibold text-ink">
          Step 5 - Portfolio / Gallery
        </h2>

        <p className="mt-1 text-[12px] text-muted">
          Showcase your work, products,
          images or achievements on your
          card.
        </p>
      </div>

      {/* =====================================================
          GALLERY
      ===================================================== */}

      <section>

        <div className="flex items-start justify-between">

          <div>
            <h3 className="text-xs font-semibold text-ink">
              Gallery / Images
            </h3>

            <p className="mt-1 text-[12px] text-muted">
              Upload images to showcase
              your work or products.
            </p>
          </div>

          <button
            type="button"
            disabled={
              uploadingImages ||
              (card.gallery?.length ?? 0) >=
                12
            }
            onClick={() =>
              imageInputRef.current?.click()
            }
            className="
              flex
              items-center
              gap-1
              text-xs
              font-medium
              text-primary
              hover:text-primary
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Plus size={17} />

            {uploadingImages
              ? "Uploading..."
              : "Add New"}
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={
              handleImageUpload
            }
          />

        </div>

        {/* =================================================
            IMAGE GRID
        ================================================= */}

        {(card.gallery?.length ?? 0) >
        0 ? (

          <div className="mt-4 grid grid-cols-4 gap-3">

            {card.gallery.map(
              (
                image,
                index
              ) => (

                <div
                  key={`${image.url}-${index}`}
                  className="
                    group
                    relative
                    h-[105px]
                    overflow-hidden
                    rounded-lg
                    border
                    border-line
                    bg-page
                  "
                >

                  <img
                    src={image.url}
                    alt={
                      image.name ||
                      `Gallery ${
                        index + 1
                      }`
                    }
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                    onError={(e) => {
                      console.error(
                        "GALLERY IMAGE LOAD ERROR:",
                        image.url
                      );

                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeImage(
                        index
                      )
                    }
                    className="
                      absolute
                      right-1
                      top-1
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-muted
                      shadow
                      hover:bg-red-50
                      hover:text-red-500
                    "
                  >
                    <X size={16} />
                  </button>

                </div>

              )
            )}

          </div>

        ) : (

          <div
            onClick={() =>
              !uploadingImages &&
              imageInputRef.current?.click()
            }
            className="
              mt-4
              flex
              h-[120px]
              cursor-pointer
              flex-col
              items-center
              justify-center
              rounded-lg
              border
              border-dashed
              border-line
              bg-page
              hover:border-primary-light
              hover:bg-accent/30
            "
          >

            {uploadingImages ? (
              <>
                <Upload
                  size={25}
                  className="animate-pulse text-primary-light"
                />

                <p className="mt-2 text-[12px] text-primary-light">
                  Uploading image...
                </p>
              </>
            ) : (
              <>
                <ImageIcon
                  size={25}
                  className="text-muted"
                />

                <p className="mt-2 text-[12px] text-muted">
                  Click to upload images
                </p>
              </>
            )}

          </div>

        )}

        <p className="mt-3 text-[12px] text-muted">
          JPG, PNG or WEBP. Maximum
          5MB per image. Maximum 12
          images.
        </p>

      </section>

      {/* =====================================================
          VIDEOS
      ===================================================== */}

      <section>

        <div className="flex items-start justify-between">

          <div>
            <h3 className="text-xs font-semibold text-ink">
              Videos (YouTube / Vimeo)
            </h3>

            <p className="mt-1 text-[12px] text-muted">
              Add videos to showcase
              your work or introduction.
            </p>
          </div>

          <button
            type="button"
            onClick={addVideo}
            className="
              flex
              items-center
              gap-1
              text-[12px]
              font-medium
              text-primary
              hover:text-primary
            "
          >
            <Plus size={17} />
            Add New
          </button>

        </div>

        <div className="mt-3 space-y-2">

          {videos.length === 0 ? (

            <div
              className="
                rounded-lg
                border
                border-dashed
                border-line
                bg-page
                px-4
                py-4
                text-center
              "
            >
              <Play
                size={20}
                className="mx-auto text-muted"
              />

              <p className="mt-1 text-xs text-muted">
                Add YouTube or Vimeo
                videos
              </p>
            </div>

          ) : (

            videos.map(
              (video) => (

                <div
                  key={video.id}
                  className="flex items-center gap-2"
                >

                  <div
                    className="
                      flex
                      h-[38px]
                      w-[38px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      border
                      border-line
                      bg-page
                    "
                  >
                    <Play
                      size={15}
                      className="text-muted"
                    />
                  </div>

                  <input
                    type="url"
                    value={video.url}
                    onChange={(e) =>
                      updateVideo(
                        video.id,
                        e.target.value
                      )
                    }
                    placeholder="https://www.youtube.com/watch?v=abc123"
                    className="
                      h-[38px]
                      flex-1
                      rounded-md
                      border
                      border-line
                      bg-white
                      px-3
                      text-xs
                      text-ink
                      outline-none
                      focus:border-primary-light
                      focus:ring-2
                      focus:ring-line
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeVideo(
                        video.id
                      )
                    }
                    className="
                      flex
                      h-[38px]
                      w-[38px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      border
                      border-line
                      text-red-500
                      hover:bg-red-50
                    "
                  >
                    <Trash2 size={15} />
                  </button>

                </div>

              )
            )

          )}

        </div>

      </section>

      {/* =====================================================
          CERTIFICATES
      ===================================================== */}

      <section>

        <div className="flex items-start justify-between">

          <div>
            <h3 className="text-xs font-semibold text-ink">
              Achievements / Certificates
            </h3>

            <p className="mt-1 text-xs text-muted">
              Upload certificates or
              achievements (optional).
            </p>
          </div>

          <button
            type="button"
            disabled={
              uploadingCertificates
            }
            onClick={() =>
              certificateInputRef.current?.click()
            }
            className="
              flex
              items-center
              gap-1
              text-xs
              font-medium
              text-primary
              hover:text-primary
              disabled:opacity-40
            "
          >
            <Plus size={17} />

            {uploadingCertificates
              ? "Uploading..."
              : "Add New"}
          </button>

          <input
            ref={
              certificateInputRef
            }
            type="file"
            accept="application/pdf"
            multiple
            hidden
            onChange={
              handleCertificateUpload
            }
          />

        </div>

        <div className="mt-3 space-y-2">

          {certificates.length === 0 ? (

            <div
              onClick={() =>
                !uploadingCertificates &&
                certificateInputRef.current?.click()
              }
              className="
                flex
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-dashed
                border-line
                bg-page
                px-4
                py-5
                hover:border-primary-light
                hover:bg-accent/30
              "
            >

              <Upload
                size={18}
                className="text-muted"
              />

              <span className="text-xs text-muted">
                Upload PDF certificates
              </span>

            </div>

          ) : (

            certificates.map(
              (certificate) => (

                <div
                  key={certificate.id}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-line
                    bg-white
                    px-3
                    py-2
                  "
                >

                  <div
                    className="
                      flex
                      h-[34px]
                      w-[34px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      bg-red-50
                      text-red-500
                    "
                  >
                    <FileText
                      size={17}
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-xs font-medium text-ink">
                      {certificate.name}
                    </p>

                    <p className="mt-[2px] text-[12px] text-muted">
                      {formatFileSize(
                        certificate.size
                      )}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeCertificate(
                        certificate.id
                      )
                    }
                    className="
                      text-muted
                      hover:text-red-500
                    "
                  >
                    <X size={14} />
                  </button>

                </div>

              )
            )

          )}

        </div>

      </section>

    </div>
  );
}
"use client";

import {
  Phone,
  MessageCircle,
  Mail,
  Globe,
  MapPin,
  Map,
} from "lucide-react";

import { useDigitalCard } from "../DigitalCardEditor";

export default function Contact() {
  const {
    card,
    updateCard,
  } = useDigitalCard();

  return (
    <div>

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-lg font-semibold">
          Step 2 - Contact Details
        </h1>

        <p className="mt-1 text-[12px] text-muted">
          Add your contact information which
          will be shown on your card.
        </p>

      </div>

      <div className="space-y-5">

        {/* MOBILE */}

        <ContactInput
          icon={<Phone size={15} />}
          label="Mobile Number"
          required
          value={card.mobile}
          onChange={(value) =>
            updateCard(
              "mobile",
              value
            )
          }
          placeholder="+91 87091 22663"
        />

        {/* WHATSAPP */}

        <ContactInput
          icon={
            <MessageCircle size={15} />
          }
          label="WhatsApp Number"
          value={card.whatsapp}
          onChange={(value) =>
            updateCard(
              "whatsapp",
              value
            )
          }
          placeholder="+91 87091 22663"
        />

        {/* EMAIL */}

        <ContactInput
          icon={<Mail size={15} />}
          label="Email Address"
          required
          type="email"
          value={card.email}
          onChange={(value) =>
            updateCard(
              "email",
              value
            )
          }
          placeholder="info@softfyr.com"
        />

        {/* WEBSITE */}

        <ContactInput
          icon={<Globe size={15} />}
          label="Website"
          type="url"
          value={card.website}
          onChange={(value) =>
            updateCard(
              "website",
              value
            )
          }
          placeholder="https://softfyr.com"
        />

        {/* ADDRESS */}

        <div>

          <label className="mb-2 block text-[12px] font-medium">
            Address
          </label>

          <div className="relative">

            <MapPin
              size={18}
              className="absolute left-4 top-4 text-primary-light"
            />

            <textarea
              rows={2}
              value={card.address}
              onChange={(e) =>
                updateCard(
                  "address",
                  e.target.value
                )
              }
              placeholder="Enter complete address"
              className="w-full resize-none rounded-lg border border-line py-4 pl-11 pr-4 text-[12px] outline-none focus:border-primary-light focus:ring-2 focus:ring-line"
            />

          </div>

        </div>

        {/* GOOGLE MAP */}

        <ContactInput
          icon={<Map size={15} />}
          label="Google Map Link"
          type="url"
          value={card.googleMapLink}
          onChange={(value) =>
            updateCard(
              "googleMapLink",
              value
            )
          }
          placeholder="https://maps.app.goo.gl/..."
        />

      </div>

    </div>
  );
}

function ContactInput({
  icon,
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-[12px] font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">

        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-lg border border-line py-3.5 pl-11 pr-4 text-[12px] outline-none focus:border-primary-light focus:ring-2 focus:ring-line"
        />

      </div>

    </div>
  );
}
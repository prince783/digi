import mongoose, {
  Schema,
  Model,
  Document,
} from "mongoose";

export type PricingProjectType =
  | "digital-visiting-card"
  | "resume"
  | "biography"
  | "catalog";

export interface IPricing extends Document {
  projectType: PricingProjectType;
  yearlyPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema<IPricing>(
  {
    projectType: {
      type: String,
      enum: [
        "digital-visiting-card",
        "resume",
        "biography",
        "catalog",
      ],
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    yearlyPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Pricing: Model<IPricing> =
  mongoose.models.Pricing ||
  mongoose.model<IPricing>(
    "Pricing",
    PricingSchema
  );

export default Pricing;
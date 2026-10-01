import mongoose, { Document, Model, Schema } from "mongoose";

export interface IResumeBilling {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  template: string;
  color: string;
  resume: Record<string, unknown>;
  billing: IResumeBilling;
  paymentStatus: "pending" | "paid" | "failed";
  paymentOrderId: string | null;
  razorpayOrderId: string | null;
  paymentId: string | null;
  razorpayPaymentId: string | null;
  paymentSignature: string | null;
  razorpaySignature: string | null;
  paymentAmount: number;
  paidAt: Date | null;
  subscriptionStart?: Date | null;
  expiresAt?: Date | null;
  isPublished: boolean;
  accountStatus?: "active" | "pending" | "expired" | "suspended";
  suspendedAt?: Date | null;
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_-]{3,30}$/,
    },
    template: {
      type: String,
      required: true,
      default: "modern",
    },
    color: {
      type: String,
      required: true,
      default: "#1E3A5F",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    resume: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    billing: {
      type: new Schema<IResumeBilling>(
        {
          address: { type: String, default: "", trim: true },
          city: { type: String, default: "", trim: true },
          state: { type: String, default: "", trim: true },
          pincode: { type: String, default: "", trim: true },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentOrderId: { type: String, default: null },
    razorpayOrderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    paymentSignature: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paymentAmount: { type: Number, default: 0, min: 0 },
    paidAt: { type: Date, default: null },
    subscriptionStart: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    isPublished: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: ["active", "pending", "expired", "suspended"],
      default: "pending",
    },
    suspendedAt: { type: Date, default: null },
    suspensionReason: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

ResumeSchema.index({
  paymentStatus: 1,
  paidAt: -1,
});

if (mongoose.models.Resume && !mongoose.models.Resume.schema.paths.accountStatus) {
  delete mongoose.models.Resume;
}

const Resume: Model<IResume> =
  mongoose.models.Resume ||
  mongoose.model<IResume>("Resume", ResumeSchema);

export default Resume;

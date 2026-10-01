import mongoose, { Model, Schema } from "mongoose";

export interface IOtpVerification extends mongoose.Document {
  mobile: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  verifiedAt: Date | null;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    mobile: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const OtpVerification: Model<IOtpVerification> =
  mongoose.models.OtpVerification ||
  mongoose.model<IOtpVerification>("OtpVerification", OtpVerificationSchema);

export default OtpVerification;

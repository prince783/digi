import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;

  projectId: mongoose.Types.ObjectId;

  projectType:
    | "digital-visiting-card"
    | "resume"
    | "biography";

  amount: number;

  currency: string;

  paymentStatus:
    | "pending"
    | "paid"
    | "failed";

  razorpayOrderId?: string;

  razorpayPaymentId?: string;

  razorpaySignature?: string;

  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    projectType: {
      type: String,
      enum: [
        "digital-visiting-card",
        "resume",
        "biography",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
      ],
      default: "pending",
    },

    razorpayOrderId: String,

    razorpayPaymentId: String,

    razorpaySignature: String,

    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>(
    "Payment",
    PaymentSchema
  );

export default Payment;
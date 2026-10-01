import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId | null;

  productType: "card" | "catalog" | "resume";
  productId: mongoose.Types.ObjectId;

  invoiceNumber: string;

  productName: string;
  customerName: string;
  customerEmail: string;

  amount: number;

  paymentId: string;
  orderId: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  paidAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    productType: {
      type: String,
      enum: ["card", "catalog", "resume"],
      required: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    productName: { type: String, default: "" },
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },

    amount: { type: Number, default: 0 },

    paymentId: { type: String, default: "" },
    orderId: { type: String, default: "" },

    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },

    paidAt: { type: Date, required: true },
  },
  { timestamps: true },
);

InvoiceSchema.index({ productType: 1, productId: 1 }, { unique: true });
InvoiceSchema.index({ paidAt: -1 });

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;

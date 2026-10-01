import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export type SupportCategory =
  | "Account"
  | "Digital Visiting Card"
  | "Resume"
  | "Biography"
  | "Payment"
  | "Subscription"
  | "Technical Issue"
  | "Other";

export type SupportPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Urgent";

export type SupportStatus =
  | "Open"
  | "In Progress"
  | "Resolved"
  | "Closed";

export interface ISupportTicket extends Document {
  userId: string | null;

  name: string;
  email: string;
  mobile: string;

  category: SupportCategory;
  subject: string;
  message: string;

  priority: SupportPriority;
  status: SupportStatus;

  adminReply: string;

  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema =
  new Schema<ISupportTicket>(
    {
      /* =========================================
         USER
      ========================================= */

      userId: {
        type: String,
        default: null,
        index: true,
      },

      /* =========================================
         USER DETAILS
      ========================================= */

      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
        maxlength: 150,
      },

      mobile: {
        type: String,
        default: "",
        trim: true,
        maxlength: 20,
      },

      /* =========================================
         SUPPORT REQUEST
      ========================================= */

      category: {
        type: String,
        enum: [
          "Account",
          "Digital Visiting Card",
          "Resume",
          "Biography",
          "Payment",
          "Subscription",
          "Technical Issue",
          "Other",
        ],
        default: "Other",
      },

      subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
      },

      /* =========================================
         TICKET MANAGEMENT
      ========================================= */

      priority: {
        type: String,
        enum: [
          "Low",
          "Medium",
          "High",
          "Urgent",
        ],
        default: "Medium",
      },

      status: {
        type: String,
        enum: [
          "Open",
          "In Progress",
          "Resolved",
          "Closed",
        ],
        default: "Open",
        index: true,
      },

      adminReply: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>(
    "SupportTicket",
    SupportTicketSchema
  );

export default SupportTicket;
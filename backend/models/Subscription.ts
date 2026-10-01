import mongoose, {
  Schema,
  Model,
  Document,
} from "mongoose";

export interface ISubscription
  extends Document {
  userId: mongoose.Types.ObjectId;

  projectId: mongoose.Types.ObjectId;

  projectType:
    | "digital-visiting-card"
    | "resume"
    | "biography";

  status:
    | "pending"
    | "active"
    | "expired"
    | "cancelled";

  amount: number;

  paymentDate?: Date;

  startDate?: Date;

  endDate?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const SubscriptionSchema =
  new Schema<ISubscription>(
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

      status: {
        type: String,
        enum: [
          "pending",
          "active",
          "expired",
          "cancelled",
        ],
        default: "pending",
      },

      amount: {
        type: Number,
        default: 0,
      },

      paymentDate: Date,

      startDate: Date,

      endDate: Date,
    },
    {
      timestamps: true,
    }
  );

SubscriptionSchema.index({
  projectId: 1,
  projectType: 1,
});

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>(
    "Subscription",
    SubscriptionSchema
  );

export default Subscription;
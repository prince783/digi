import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

/* =========================================================
   USER INTERFACE
========================================================= */

export interface IUser extends Document {
  name: string;
  designation: string;
  companyName: string;
  email: string;
  mobile: string;

  profilePhoto: string;
  bio?: string;

  role: "user" | "admin";

  isVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   USER SCHEMA
========================================================= */

const UserSchema = new Schema<IUser>(
  {
    /* =====================================================
       BASIC INFORMATION
    ===================================================== */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================================================
       EMAIL
    ===================================================== */

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /* =====================================================
       MOBILE
    ===================================================== */

    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    /* =====================================================
       PROFILE PHOTO
    ===================================================== */

    profilePhoto: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    /* =====================================================
       USER ROLE

       Every user MUST have a role.

       Normal registration:
       role = "user"

       Admin account:
       role = "admin"
    ===================================================== */

    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
      trim: true,
    },

    /* =====================================================
       VERIFICATION
    ===================================================== */

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
   MODEL

   Reuse the existing model if Mongoose has already
   registered it. Otherwise create a new model.
========================================================= */

const User: Model<IUser> =
  mongoose.models.User ??
  mongoose.model<IUser>("User", UserSchema);

export default User;
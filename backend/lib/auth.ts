import crypto from "crypto";
import { cookies } from "next/headers";

import connectDB from "@/app/lib/db";
import Session from "@/app/models/Session";
import User from "@/app/models/User";
import { isAdminMobile } from "@/app/lib/adminAllowlist";

const SESSION_COOKIE = "session_token";

const SESSION_DURATION =
  60 * 60 * 4; // 4 hours

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createSession(
  userId: string
) {
  await connectDB();

  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION * 1000
  );

  await Session.create({
    userId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    token,
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge: SESSION_DURATION,
    }
  );

  return token;
}

export async function getCurrentUser() {
  await connectDB();

  const cookieStore = await cookies();

  const token =
    cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = await Session.findOne({
    tokenHash,
  });

  if (!session) {
    return null;
  }

  if (
    session.expiresAt.getTime() <=
    Date.now()
  ) {
    await Session.deleteOne({
      _id: session._id,
    });

    return null;
  }

  const user = await User.findById(
    session.userId
  ).lean();

  if (!user) {
    await Session.deleteOne({
      _id: session._id,
    });

    return null;
  }

  return user;
}

export async function getCurrentAdmin() {
  const user = await getCurrentUser();

  /*
   * Checked against the fixed admin mobile allowlist, not
   * just the DB's role field — so only those numbers can
   * ever reach the admin panel, regardless of how a stray
   * role: "admin" record might end up in the database.
   */
  if (
    !user ||
    user.role !== "admin" ||
    !isAdminMobile(user.mobile)
  ) {
    return null;
  }

  return user;
}

export async function deleteCurrentSession() {
  await connectDB();

  const cookieStore = await cookies();

  const token =
    cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashToken(token);

    await Session.deleteOne({
      tokenHash,
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}
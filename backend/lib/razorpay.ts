import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId) {
  throw new Error("RAZORPAY_KEY_ID is missing in .env.local");
}

if (!keySecret) {
  throw new Error("RAZORPAY_KEY_SECRET is missing in .env.local");
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export { keyId as razorpayKeyId };
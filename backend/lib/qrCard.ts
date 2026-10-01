import QRCode from "qrcode";
import sharp from "sharp";

/*
 * Branded QR download card: ~3in x 4in at 300dpi (900x1200px).
 */
const CARD_WIDTH = 900;
const CARD_HEIGHT = 1200;
const QR_SIZE = 620;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateQrCardJpeg(options: {
  businessName: string;
  subtitle: string;
  link: string;
}): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(options.link, {
    margin: 1,
    width: QR_SIZE,
    color: {
      dark: "#121212",
      light: "#FFFFFF",
    },
  });

  const businessName = escapeXml(options.businessName || "DigiProfilo");
  const subtitle = escapeXml(options.subtitle || "");
  const qrX = (CARD_WIDTH - QR_SIZE) / 2;
  const qrY = 260;

  const svg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#FAF9F6" />
      <rect width="${CARD_WIDTH}" height="140" fill="#1E3A5F" />
      <text x="${CARD_WIDTH / 2}" y="88" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#FFFFFF" text-anchor="middle">${businessName}</text>
      <text x="${CARD_WIDTH / 2}" y="200" font-family="Arial, sans-serif" font-size="30" fill="#77736E" text-anchor="middle">${subtitle}</text>
      <rect x="${qrX - 20}" y="${qrY - 20}" width="${QR_SIZE + 40}" height="${QR_SIZE + 40}" fill="#FFFFFF" stroke="#E5E0D9" stroke-width="2" rx="16" />
      <image x="${qrX}" y="${qrY}" width="${QR_SIZE}" height="${QR_SIZE}" href="${qrDataUrl}" />
      <text x="${CARD_WIDTH / 2}" y="${qrY + QR_SIZE + 80}" font-family="Arial, sans-serif" font-size="26" fill="#121212" text-anchor="middle">Scan to view profile</text>
      <text x="${CARD_WIDTH / 2}" y="${CARD_HEIGHT - 40}" font-family="Arial, sans-serif" font-size="22" fill="#77736E" text-anchor="middle">Powered by DigiProfilo</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
}

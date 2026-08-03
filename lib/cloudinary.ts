import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function uploadScreenshotToCloudinary(base64Data: string): Promise<string> {
  // If Cloudinary credentials are not configured, return base64 string directly
  if (!cloudName || !apiKey || !apiSecret) {
    console.log('[Cloudinary] Config missing. Returning raw base64 data.');
    return base64Data;
  }

  // If string is already a URL (e.g. http:// or https://), return it
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }

  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'teleshop_payment_receipts',
      resource_type: 'image',
    });
    console.log('[Cloudinary] Image uploaded successfully:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('[Cloudinary] Upload error:', error.message || error);
    // Fall back to original base64 string on upload error
    return base64Data;
  }
}

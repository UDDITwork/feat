const cloudinary = require('cloudinary').v2;

const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.warn('⚠️  Cloudinary environment variables missing:', missingVars.join(', '));
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const uploadDocument = async (fileBuffer, folder, resourceType = 'auto') => {
  if (missingVars.length > 0) {
    throw new Error('Cloudinary is not configured. Please set the required environment variables.');
  }

  if (!fileBuffer) {
    throw new Error('No file buffer provided for Cloudinary upload.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const uploadBase64Document = async (base64Data, folder, resourceType = 'auto') => {
  if (missingVars.length > 0) {
    throw new Error('Cloudinary is not configured. Please set the required environment variables.');
  }

  if (!base64Data) {
    throw new Error('No data provided for Cloudinary upload.');
  }

  const cleanedBase64 = base64Data.startsWith('data:')
    ? base64Data
    : `data:application/octet-stream;base64,${base64Data}`;

  return cloudinary.uploader.upload(cleanedBase64, {
    folder,
    resource_type: resourceType,
  });
};

const DEFAULT_DOWNLOAD_TTL_SECONDS = 60;

const inferResourceType = (document) => {
  if (document?.resourceType) {
    return document.resourceType;
  }

  const format = (document?.format || '').toLowerCase();

  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip'].includes(format)) {
    return 'raw';
  }

  return 'image';
};

const generatePrivateDownloadUrl = (document, options = {}) => {
  if (missingVars.length > 0) {
    throw new Error('Cloudinary is not configured. Please set the required environment variables.');
  }

  if (!document?.publicId) {
    throw new Error('Document is missing a Cloudinary publicId.');
  }

  const format = document.format || 'pdf';
  const resourceType = inferResourceType(document);
  const expiresAtUnix = Math.floor(Date.now() / 1000) + (options.expiresInSeconds || DEFAULT_DOWNLOAD_TTL_SECONDS);

  const signedUrl = cloudinary.utils.private_download_url(document.publicId, format, {
    resource_type: resourceType,
    attachment: options.attachment || false,
    expires_at: expiresAtUnix,
  });

  return signedUrl;
};

module.exports = {
  uploadDocument,
  uploadBase64Document,
  generatePrivateDownloadUrl,
  inferResourceType,
  cloudinary,
};


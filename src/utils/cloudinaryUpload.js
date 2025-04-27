/**
 * NOTE: Direct Cloudinary uploads have been removed. 
 * 
 * Image uploads are now handled by the backend using multer-storage-cloudinary.
 * 
 * Frontend sends the image file to the backend as part of FormData,
 * and the backend handles the Cloudinary upload process.
 */

import axios from 'axios';

/**
 * Uploads an image file to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadImageToCloudinary = async (file, folder = 'profiles') => {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'edutrackr_uploads'); // Replace with your upload preset
    formData.append('folder', folder);

    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', // Replace with your cloud name
      formData
    );

    if (!response.data || !response.data.secure_url) {
      throw new Error('Invalid response from Cloudinary');
    }

    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image: ' + (error.message || 'Unknown error'));
  }
};

export default uploadImageToCloudinary; 
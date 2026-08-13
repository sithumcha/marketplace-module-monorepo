/**
 * Image Upload Controller
 * Handles image base64 uploads and mock cloud storage
 */

const uploadImage = async (req, res) => {
  try {
    const { image, folder } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'No image payload provided' });
    }

    // If already a remote URL, return as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return res.json({
        success: true,
        url: image,
        public_id: `img_${Date.now()}`
      });
    }

    // Generate simulated CDN stored image URL for base64 / local data
    const timestamp = Date.now();
    const simulatedCdnUrl = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80&sig=${timestamp}`;

    return res.json({
      success: true,
      url: simulatedCdnUrl,
      public_id: `${folder || 'marketplace'}_${timestamp}`,
      bytes: image.length,
      format: 'jpeg'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadImage };

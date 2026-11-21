import React, { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

// Compress raw Kindle Fire camera photo to ~100KB Blob
function compressImageToBlob(file, maxWidth = 1024, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    };

    img.src = objectUrl;
  });
}

export default function CameraInput({ image, onSaveToCell }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load preview whenever formData.image changes (or resets to "")
  useEffect(() => {
    let activeUrl = null;

    async function loadPreview() {
      if (!image) {
        setPreviewUrl(null);
        return;
      }

      // If it's already an uploaded Cloudinary URL, display it directly
      if (image.startsWith('http')) {
        setPreviewUrl(image);
        return;
      }

      // Otherwise, fetch the local Blob from IndexedDB using the imageId
      const blob = await get(image);
      if (blob) {
        activeUrl = URL.createObjectURL(blob);
        setPreviewUrl(activeUrl);
      }
    }

    loadPreview();
    return () => {
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [image]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressedBlob = await compressImageToBlob(file);
    if (!compressedBlob) return;

    // 1. Save binary Blob in IndexedDB under a unique ID
    const imageId = `pit_photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await set(imageId, compressedBlob);

    // 2. Save ONLY the tiny ID string into formData.image
    onSaveToCell(imageId);

    // Reset input so you can retake a photo if needed
    e.target.value = '';
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <label
        style={{
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'inline-block',
          fontSize: '16px',
        }}
        className="input-button"
      >
        {image ? 'Retake Robot Photo' : 'Take Robot Photo'}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </label>

      {previewUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>Robot Photo Preview:</p>
          <img
            src={previewUrl}
            alt="Robot snap"
            style={{ width: '200px', borderRadius: '8px' }}
          />
        </div>
      )}
    </div>
  );
}
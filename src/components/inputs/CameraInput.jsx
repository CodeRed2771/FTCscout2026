import React, { useState } from 'react';

export default function CameraInput({ image, onSaveToCell }) {
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64DataUrl = reader.result; // "data:image/jpeg;base64,..."
      setPreviewImage(base64DataUrl);

      // Wrap it in your JSON structure and send it to your cell
      const payload = JSON.stringify({
        timestamp: Date.now(),
        image: base64DataUrl,
        source: "native_camera"
      });

      onSaveToCell(payload);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* The file input with capture attribute */}
      <label style={{ 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '8px', 
        cursor: 'pointer',
        display: 'inline-block',
        fontSize: '16px'
      }} className="input-button">
        Take Photo
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
      </label>

      {/* Preview */}
      {image && (
        <div style={{ marginTop: '20px' }}>
          <p>Captured Image Preview:</p>
          <img src={JSON.parse(image).image} alt="Captured snap" style={{ width: '200px', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
}
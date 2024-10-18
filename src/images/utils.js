// Utility function to convert dataURL to Blob
export const dataURLtoBlob = (dataURL) => {
    try {
      const byteString = atob(dataURL.split(',')[1]);
      const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (error) {
      console.error('Error converting dataURL to Blob:', error);
      return null;
    }
  };

   // Utility function to create a thumbnail
   export const createThumbnail = (dataURL, width = 50, height = 50) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (error) => {
        console.error('Error creating thumbnail:', error);
        reject(error);
      };
      img.src = dataURL;
    });
  };
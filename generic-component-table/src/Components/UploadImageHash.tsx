import React, { useRef, useState, useCallback, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { Button } from './Button';

interface ImageUploaderProps {
  value?: string; // <- necesario para React Hook Form
  onChange: (base64: string) => void;
  maxSizeMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, maxSizeMB = 0.2 }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropping, setCropping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  useEffect(() => {
    // actualizar preview si viene value desde fuera (por ejemplo, en modo edición)
    if (value && value !== previewUrl) {
      setPreviewUrl(value);
    }
  }, [value]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setCropping(true);
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string));
      reader.readAsDataURL(file);
    });
  };

  const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

    const croppedFile = new File([croppedImageBlob], 'cropped.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    const compressedFile = await imageCompression(croppedFile, {
      maxSizeMB,
      useWebWorker: true,
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      onChange(base64); // <- comunica el valor al formulario
    };
    reader.readAsDataURL(compressedFile);

    setCropping(false);
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setImageSrc(null);
    setCropping(false);
    onChange(''); // limpia en el formulario
  };

  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <Button onClick={() => inputRef.current?.click()}>Subir imagen</Button>

      {cropping && imageSrc && (
        <div className="relative w-full h-80 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
          <div className="absolute bottom-2 left-2">
            <Button onClick={handleCrop}>Recortar y usar</Button>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="flex flex-col items-start gap-2">
          <img src={previewUrl} alt="Preview" className="w-32 h-auto rounded shadow" />
          <Button variant="outlined" onClick={clearImage}>Quitar imagen</Button>
        </div>
      )}
    </div>
  );
};

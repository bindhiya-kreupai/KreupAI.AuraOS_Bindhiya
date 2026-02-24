"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react";

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoSave?: (croppedImageData: string) => void;
}

export default function ProfilePhotoUpload({
  currentPhoto = "https://i.pravatar.cc/300",
  onPhotoSave,
}: ProfilePhotoUploadProps) {
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [savedPhoto, setSavedPhoto] = useState<string>(currentPhoto);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, outputSize, outputSize);

      ctx.save();
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.translate(-outputSize / 2 + offset.x, -outputSize / 2 + offset.y);

      const scale = Math.max(outputSize / img.width, outputSize / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const dx = (outputSize - scaledWidth) / 2;
      const dy = (outputSize - scaledHeight) / 2;

      ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);
      ctx.restore();

      const croppedData = canvas.toDataURL("image/png");
      setSavedPhoto(croppedData);
      onPhotoSave?.(croppedData);
      setShowCropper(false);
    };
    img.src = imageSrc;
  };

  const handleCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <>
      {/* Profile Photo Display */}
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
          <img
            src={savedPhoto}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-6 h-6 text-white mb-1" />
          <span className="text-xs text-white font-medium">Change</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Crop Modal */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Crop Profile Photo
              </h4>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Crop Area */}
            <div
              ref={cropAreaRef}
              className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-2 border-dashed border-indigo-300 dark:border-indigo-600 cursor-move bg-slate-100 dark:bg-slate-800"
              onMouseDown={handleMouseDown}
            >
              <img
                ref={(el) => { imageRef.current = el; }}
                src={imageSrc}
                alt="Crop preview"
                className="absolute w-full h-full object-cover select-none pointer-events-none"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
                draggable={false}
              />
              {/* Circular overlay guide */}
              <div className="absolute inset-0 rounded-full border-4 border-white/50 pointer-events-none" />
            </div>

            <p className="text-xs text-slate-400 text-center mt-2 mb-4">
              Drag to reposition. Use controls below to zoom and rotate.
            </p>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 px-3">
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={zoom * 100}
                  onChange={(e) => setZoom(Number(e.target.value) / 100)}
                  className="w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                />
                <span className="text-xs text-slate-400 w-10">{Math.round(zoom * 100)}%</span>
              </div>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Photo
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Hidden canvas for output */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </>
  );
}

"use client";
import React from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

type Props = {
  open: boolean;
  src: string;
  onClose: () => void;
  onSaved: (url: string) => void;
  uploadBlob: (b: Blob) => Promise<string>;
};

export default function ImageEditorModal({ open, src, onClose, onSaved, uploadBlob }: Props) {
  const ref = React.useRef<ReactCropperElement>(null);

  const handleSave = async () => {
    const cropper = ref.current?.cropper;
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({
      fillColor: "#fff",
      imageSmoothingQuality: "high",
    });
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b: Blob | null) => {
        if (!b) return reject(new Error("toBlob returned null"));
        resolve(b);
      }, "image/jpeg", 0.9);
    });
    const url = await uploadBlob(blob);
    onSaved(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden">
        <div className="p-3 border-b font-semibold">ویرایش تصویر</div>
        <div className="p-3">
          <Cropper
            ref={ref}
            src={src}
            viewMode={1}
            guides={true}
            background={false}
            autoCropArea={1}
            responsive={true}
            checkOrientation={false}
            style={{ width: "100%", height: 400 }}
          />
        </div>
        <div className="p-3 border-t flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            انصراف
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-navy text-white">
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
}

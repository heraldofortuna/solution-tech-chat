"use client";
import Image from 'next/image'
import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export function FilePreview({ files, onRemoveFile }: FilePreviewProps) {
  return (
    <div className="flex flex-wrap gap-4 p-2 border rounded-lg">
      {files.map((file, index) => (
        <div key={index} className="relative">
          {file.type.startsWith('image/') ? (
            <Image 
              src={URL.createObjectURL(file)} 
              width={600}
              height={600}
              alt="Preview" 
              className="h-16 w-16 object-cover rounded"
            />
          ) : file.type === 'application/pdf' ? (
            <div className="h-16 w-16 bg-red-100 flex items-center justify-center rounded">
              <span className="text-xs text-red-600">PDF</span>
            </div>
          ) : file.type === 'video/mp4' ? (
            <div className="h-16 w-16 bg-blue-100 flex items-center justify-center rounded">
              <span className="text-xs text-blue-600">MP4</span>
            </div>
          ) : (
            <div className="h-16 w-16 bg-blue-100 flex items-center justify-center rounded">
              <span className="text-xs text-blue-600">File</span>
            </div>
          )}
          <Button
            type="button"
            onClick={() => onRemoveFile(index)}
            className="absolute -top-2 -right-2 bg-gray-200 !w-6 !h-6 rounded-lg p-1 cursor-pointer"
          >
            X
          </Button>
        </div>
      ))}
    </div>
  );
}
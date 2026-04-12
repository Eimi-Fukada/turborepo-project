"use client";

import { FC, useRef, useState, useEffect } from "react";
import { Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

interface ImageCropperProps {
  imageUrl?: string;
  onCrop?: (base64: string) => void;
}

const ImageCropper: FC<ImageCropperProps> = ({ imageUrl, onCrop }) => {
  const cropperRef = useRef<any>(null);
  const [image, setImage] = useState<string>(imageUrl || "");

  const handleUpload: UploadProps["onChange"] = (info) => {
    if (info.file.status === "error") {
      message.error(`${info.file.name} 上传失败`);
      return;
    }

    // 读取上传的文件
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(info.file.originFileObj as Blob);
  };

  const getCropData = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const base64 = cropperRef.current?.cropper.getCroppedCanvas().toDataURL();
      onCrop?.(base64);
    }
  };

  // 监听图片变化，当图片加载完成后自动裁剪
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        setTimeout(() => {
          getCropData();
        }, 100);
      };
    }
  }, [image]);

  return (
    <div>
      <div className="mb-4">
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={({ file, onSuccess }) => {
            setTimeout(() => {
              onSuccess?.("ok");
            }, 0);
          }}
          onChange={handleUpload}
        >
          <Button icon={<UploadOutlined />}>选择图片</Button>
        </Upload>
      </div>
      {image && (
        <div>
          <Cropper
            ref={cropperRef}
            src={image}
            style={{ height: 400, width: "100%" }}
            aspectRatio={1}
            guides={true}
            preview=".preview"
            viewMode={1}
            dragMode="move"
            cropBoxMovable={true}
            cropBoxResizable={true}
            toggleDragModeOnDblclick={false}
            crop={getCropData}
            ready={getCropData}
          />
          <div className="mt-4">
            <div
              className="preview"
              style={{
                width: "150px",
                height: "150px",
                overflow: "hidden",
                margin: "0 auto",
                borderRadius: "50%",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;

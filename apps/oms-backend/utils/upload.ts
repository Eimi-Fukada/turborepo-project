import { post } from "@/request";
import { UploadFile } from "antd";

export async function uploadAliyun(fileList: UploadFile[]) {
  const uploadTasks = fileList.map(async (file) => {
    const rawFile = file?.originFileObj as File;
    const formData = new FormData();
    formData.append("file", rawFile);
    const { data } = await post("/commonService/upload", formData);
    return data.path;
  });

  return Promise.all(uploadTasks);
}

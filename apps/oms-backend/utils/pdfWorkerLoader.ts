import { GlobalWorkerOptions } from "pdfjs-dist";

export async function setupPdfWorker() {
  try {
    // 动态导入 worker
    const workerModule = await import("pdfjs-dist/build/pdf.worker.mjs");
    const workerBlob = new Blob([workerModule.default], {
      type: "text/javascript",
    });
    const workerUrl = URL.createObjectURL(workerBlob);
    GlobalWorkerOptions.workerSrc = workerUrl;
    return workerUrl;
  } catch (error) {
    console.error("PDF worker 加载失败:", error);
    throw error;
  }
}

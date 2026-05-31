/**
 * Generate a grid image (3x3) of products
 * - If products > 9, create multiple images
 */
export async function generateGridImages(
  selectedItems: Array<{
    group: string;
    variant: string;
    image_url: string | null;
    stock?: number;
  }>,
  options: { showStock?: boolean } = {},
): Promise<Blob[]> {
  const images: Blob[] = [];
  const itemsPerPage = 9; // 3x3 grid

  // Split into chunks of 9
  for (let i = 0; i < selectedItems.length; i += itemsPerPage) {
    const chunk = selectedItems.slice(i, i + itemsPerPage);
    try {
      const blob = await createGridImage(chunk, options);
      images.push(blob);
    } catch (error) {
      console.error("Error creating grid image:", error);
      throw error;
    }
  }

  return images;
}

async function createGridImage(
  items: Array<{
    group: string;
    variant: string;
    image_url: string | null;
    stock?: number;
  }>,
  options: { showStock?: boolean },
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Cannot get canvas context"));
        return;
      }

      const itemWidth = 300;
      const itemHeight = 350;
      const cols = 3;
      const rows = 3;

      canvas.width = itemWidth * cols;
      canvas.height = itemHeight * rows;

      // Fill background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = "#f3f4f6";
      ctx.lineWidth = 1;
      for (let i = 1; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * itemWidth, 0);
        ctx.lineTo(i * itemWidth, canvas.height);
        ctx.stroke();
      }
      for (let i = 1; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * itemHeight);
        ctx.lineTo(canvas.width, i * itemHeight);
        ctx.stroke();
      }

      const imageObjectUrls: string[] = [];

      // Draw items
      let itemIndex = 0;
      for (let row = 0; row < rows && itemIndex < items.length; row++) {
        for (let col = 0; col < cols && itemIndex < items.length; col++) {
          const item = items[itemIndex];
          const x = col * itemWidth;
          const y = row * itemHeight;
          const padding = 10;
          const maxImgWidth = itemWidth - padding * 2;
          const maxImgHeight = 200;

          ctx.fillStyle = "#f9fafb";
          ctx.fillRect(x + padding, y + padding, maxImgWidth, maxImgHeight);

          if (item.image_url) {
            try {
              const { image, objectUrl } = await loadImage(item.image_url);
              if (objectUrl) imageObjectUrls.push(objectUrl);

              const ratio = image.width / image.height;
              let imgWidth = maxImgWidth;
              let imgHeight = maxImgWidth / ratio;

              if (imgHeight > maxImgHeight) {
                imgHeight = maxImgHeight;
                imgWidth = maxImgHeight * ratio;
              }

              const imgX = x + (itemWidth - imgWidth) / 2;
              const imgY = y + padding + (maxImgHeight - imgHeight) / 2;

              ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
            } catch (error) {
              console.warn("Could not draw product image:", error);
              drawImagePlaceholder(ctx, x + padding, y + padding, maxImgWidth, maxImgHeight);
            }
          } else {
            drawImagePlaceholder(ctx, x + padding, y + padding, maxImgWidth, maxImgHeight);
          }

          drawProductText(ctx, item, x, y, itemWidth, itemHeight, options);
          itemIndex++;
        }
      }

      canvas.toBlob((blob) => {
        imageObjectUrls.forEach((url) => URL.revokeObjectURL(url));

        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

function drawImagePlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#d1d5db";
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "16px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("No image", x + width / 2, y + height / 2);
}

function drawProductText(
  ctx: CanvasRenderingContext2D,
  item: {
    group: string;
    variant: string;
    stock?: number;
  },
  x: number,
  y: number,
  itemWidth: number,
  itemHeight: number,
  options: { showStock?: boolean },
) {
  const textX = x + itemWidth / 2;
  const maxWidth = itemWidth - 20;
  const groupY = options.showStock ? y + itemHeight - 108 : y + itemHeight - 92;
  const variantY = options.showStock ? y + itemHeight - 64 : y + itemHeight - 50;

  ctx.textAlign = "center";

  ctx.fillStyle = "#111827";
  ctx.font = "bold 18px Arial, sans-serif";
  drawWrappedText(ctx, item.group, textX, groupY, maxWidth, 21, 2);

  ctx.fillStyle = "#374151";
  ctx.font = "16px Arial, sans-serif";
  drawWrappedText(ctx, item.variant, textX, variantY, maxWidth, 19, 2);

  if (options.showStock && typeof item.stock === "number") {
    ctx.fillStyle = "#6b7280";
    ctx.font = "15px Arial, sans-serif";
    ctx.fillText(`Stock: ${item.stock}`, textX, y + itemHeight - 18);
  }
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  lines.slice(0, maxLines).forEach((line, idx) => {
    const isLastVisibleLine = idx === maxLines - 1 && lines.length > maxLines;
    ctx.fillText(isLastVisibleLine ? line + "..." : line, x, y + idx * lineHeight);
  });
}

async function loadImage(
  src: string,
): Promise<{ image: HTMLImageElement; objectUrl: string | null }> {
  const proxiedSrc = `/api/image-proxy?url=${encodeURIComponent(src)}`;

  try {
    const response = await fetch(proxiedSrc);
    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const image = await loadHtmlImage(objectUrl);
      return { image, objectUrl };
    }
  } catch {
    // Fall back to direct image loading below.
  }

  const image = await loadHtmlImage(proxiedSrc);
  return { image, objectUrl: null };
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

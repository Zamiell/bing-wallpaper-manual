import { assertNotNull } from "complete-common";
import { $, isFile, makeDirectory } from "complete-node";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { PROJECT_ROOT } from "./constants.js";
import { logger } from "./logger.js";

/**
 * - format=js - Get JSON.
 * - idx=0 - Get the latest image.
 * - n=1 - Get one image.
 * - mkt=en-US - Get the image for the United States. (The image can be different depending on the
 *   country.)
 */
const BING_API_URL =
  "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US";

const DOWNLOADS_PATH = path.join(PROJECT_ROOT, "downloads");

const HPImageArchiveImageSchema = z.object({
  url: z.string(),
});

const HPImageArchiveSchema = z.object({
  images: z.array(HPImageArchiveImageSchema).length(1),
});

type BingImage = z.infer<typeof HPImageArchiveImageSchema>;

await main();

async function main() {
  try {
    await setWallpaperFromBingAPI();
  } catch (error) {
    logger.error(error);
  }
}

async function setWallpaperFromBingAPI() {
  const imageMetadata = await getImageOfTheDayMetadataFromBingAPI();

  // This will be something like:
  // "/th?id=OHR.IrohazakaAutumn_EN-US9137140715_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp"
  const { url } = imageMetadata;

  // This will be something like:
  // https://www.bing.com/th?id=OHR.IrohazakaAutumn_EN-US9137140715_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp
  const fullURL = new URL(url, "https://www.bing.com").href;
  logger.info(`The URL for the image of the day is: ${fullURL}`);

  const fileName = getFileNameFromImageURL(fullURL);
  const filePath = path.join(DOWNLOADS_PATH, fileName);

  const fileExists = await isFile(filePath);
  if (fileExists) {
    throw new Error(
      "The image already exists. Did Bing forget to rotate the image?",
    );
  }

  await makeDirectory(DOWNLOADS_PATH);
  await downloadImage(fullURL, filePath);
  logger.info(`Successfully downloaded: ${filePath}`);

  await setWallpaper(filePath);
  logger.info(`Set wallpaper to: ${filePath}`);
}

async function getImageOfTheDayMetadataFromBingAPI(): Promise<BingImage> {
  const response = await fetch(BING_API_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch "${BING_API_URL}": ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  const validationResult = HPImageArchiveSchema.parse(data);
  const { images } = validationResult;

  // Zod validates that the length is exactly 1.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return images[0]!;
}

function getFileNameFromImageURL(imageURL: string): string {
  const url = new URL(imageURL);

  const id = url.searchParams.get("id");
  assertNotNull(
    id,
    `Failed to get the "id" parameter from the URL: ${imageURL}`,
  );

  return id;
}

async function downloadImage(imageURL: string, filePath: string) {
  const response = await fetch(imageURL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch "${imageURL}": ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);
}

async function setWallpaper(filePath: string) {
  switch (process.platform) {
    case "win32": {
      const powerShellScript = `
$code = @'
using System.Runtime.InteropServices;
public class Wallpaper {
  [DllImport("user32.dll", CharSet=CharSet.Auto)]
  public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
'@
Add-Type -TypeDefinition $code
[Wallpaper]::SystemParametersInfo(20, 0, "${filePath}", 3)
`.trimStart();

      const encodedCommand = Buffer.from(powerShellScript, "utf16le").toString(
        "base64",
      );
      await $`powershell -EncodedCommand ${encodedCommand}`;

      break;
    }

    default: {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }
}

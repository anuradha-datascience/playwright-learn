import fs from "fs";
import path from "path";

export function cleanArtifacts(): void {
  const foldersToClean = [
    "playwright-report",
    "test-results",
    "allure-results",
    "allure-report",
  ];

  for (const folder of foldersToClean) {
    const folderPath = path.join(process.cwd(), folder);
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`Cleaned folder: ${folder}`);
    }
  }
}
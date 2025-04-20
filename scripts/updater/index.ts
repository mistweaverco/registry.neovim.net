import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

interface PackageInfo {
  name: string;
  description: string;
  homepage: string;
  licenses: string[];
  languages?: string[];
  categories: string[];
}

const packagesDir = path.join(__dirname, "..", "..", "packages");
const registry: PackageInfo[] = [];

const counter = {
  success: 0,
  failure: 0,
};

const fileWalker = (packagesDir: string) => {
  const dirents = fs.readdirSync(packagesDir, {
    withFileTypes: true,
  });
  for (const dirent of dirents) {
    const dirPath = path.join(packagesDir, dirent.name);
    if (dirent.isDirectory()) {
      fileWalker(dirPath);
    } else if (dirent.name === "neovim.package.yaml") {
      try {
        const packageInfo = yaml.load(
          fs.readFileSync(path.join(packagesDir, dirent.name), "utf8"),
        ) as PackageInfo;
        registry.push(packageInfo);
        counter.success++;
      } catch (error) {
        console.error(`Error processing ${dirent.name}:`, error);
        counter.failure++;
      }
    }
  }
}

fileWalker(packagesDir);

const registryJsonPath = path.join(
  __dirname,
  "..",
  "..",
  "web",
  "static",
  "neovim-registry.json",
);
fs.writeFileSync(registryJsonPath, JSON.stringify(registry, null, 2));

console.log(`Registry file created at ${registryJsonPath}`);
console.log(`Success: ${counter.success}`);
console.log(`Failure: ${counter.failure}`);
console.log(`Total: ${counter.success + counter.failure}`);

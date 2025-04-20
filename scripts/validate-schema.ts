import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import Ajv, { type ErrorObject } from "ajv";

const ajv = new Ajv({
  strict: false,
});

const schema = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "web", "static", "package.schema.json"), "utf8"),
);

interface PackageInfo {
  name: string;
  description: string;
  homepage: string;
  licenses: string[];
  languages?: string[];
  categories: string[];
  validationErrors?: ErrorObject[];
}

type SchemaErrors = {
  name: string;
  errors: ErrorObject[];
};

const schemaErrors: SchemaErrors[] = [];

const packagesDir = path.join(__dirname, "..", "packages");

const fileWalker = (packagesDir: string) => {
  const dirents = fs.readdirSync(packagesDir, {
    withFileTypes: true,
  });
  for (const dirent of dirents) {
    const dirPath = path.join(packagesDir, dirent.name);
    if (dirent.isDirectory()) {
      fileWalker(dirPath);
    } else if (dirent.name === "neovim.package.yaml") {
        const packageInfo = yaml.load(
          fs.readFileSync(path.join(packagesDir, dirent.name), "utf8"),
        ) as PackageInfo;
      const valid = ajv.validate(schema, packageInfo);
      if (!valid) {
        schemaErrors.push({
          name: packageInfo.name,
          errors: ajv.errors || [],
        });
      }
    }
  }
}

fileWalker(packagesDir);

if (schemaErrors.length > 0) {
  console.error("Schema validation errors:");
  schemaErrors.forEach((error) => {
    console.error(`Package ${error.name}:`);
    error.errors.forEach((err) => {
      console.error(`  ${err.data} ${err.message}`);
    });
  });
  process.exit(1);
}

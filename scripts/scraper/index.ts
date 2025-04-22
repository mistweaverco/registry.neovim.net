import fs from "fs";
import { marked } from "marked";
import * as yaml from "js-yaml";

const URLS = [
  "https://raw.githubusercontent.com/rockerBOO/awesome-neovim/main/README.md",
];

Promise.all(URLS.map((url) => fetchMarkdown(url).then(processMarkdown)))
  .then((resources) => {
    const flatten = resources.reduce((acc, r) => {
      acc.push(...r);
      return acc;
    }, []);
    return flatten;
  })
  .then(saveScrapeData)
  .catch(console.error);

async function fetchMarkdown(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

function sanitizeTag(tag: string) {
  if (tag === "(requires neovim 0.5)") return "neovim-0.5";
  if (tag === "tree-sitter supported colorscheme") {
    return "treesitter-colorschemes";
  }
  return tag.toLocaleLowerCase().replace(/\s/g, "-");
}

interface Resource {
  username: string;
  description?: string;
  repo: string;
  type: "plugin" | "colorscheme"
  tags: string[];
}

function processMarkdown(text: string) {
  const resources: any[] = [];
  const tree = marked.lexer(text);
  let headings: string[] = [];
  tree.forEach((token: any) => {
    if (token.type === "heading" && token.depth > 1) {
      headings = headings.slice(0, token.depth - 2);
      headings.push(token.text.toLocaleLowerCase());
    }

    if (token.type === "list") {
      token.items.forEach((t: any) => {
        (t as any).tokens.forEach((tt: any) => {
          if (!tt.tokens) return;

          // Hardcoded deny-list for headings
          for (let i = 0; i < headings.length; i += 1) {
            const heading = headings[i];
            if (
              ["contents", "vim", "ui", "wishlist", "resource"].includes(
                heading,
              )
            ) return;
          }

          const tags = headings.map(sanitizeTag);
          const resource: Resource = {
            username: "",
            repo: "",
            tags,
            description: "",
            type: tags.includes("colorscheme") ? "colorscheme" : "plugin",
          };
          resource.tags = tags.filter((tag) => tag !== "colorscheme");
          let link = "";

          // First token is always a link
          const token = tt.tokens[0];
          if (!token) return;
          if (!token.href) return;

          // All other tokens are description
          tt.tokens.forEach((tt: any, idx: number) => {
            if (idx !== 0) {
              const description = tt.text.replace(/^\s*-\s*/, "").trim();
              if (description) {
                resource.description += description;
              }
            }
          });

          link = token.href;
          // skip non-GitHub links
          if (!link.includes("github.com")) return;

          const href = link
            .replace("https://github.com/", "")
            .replace("http://github.com", "");
          const d = href.split("/");
          resource.username = d[0];
          resource.repo = d[1].replace(/#.+/, "");
          resources.push(resource);
        });
      });
    }
  });

  return resources;
}

async function getLicense(username: string, repo: string) {
  const url = `https://api.github.com/repos/${username}/${repo}/license`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });
  if (response.status === 404) return null;
  const data = await response.json();
  if (data.message) return null;
  if (data.license) {
    return data.license.spdx_id;
  }
  return null;
}

async function saveScrapeData(resources: Resource[]) {
  const newResources = resources.sort((a, b) => {
    if (a.username === b.username) {
      return a.repo.localeCompare(b.repo);
    }
    return a.username.localeCompare(b.username);
  });
  for (const resource of newResources) {
    const path = `packages/${resource.username}/${resource.repo}/neovim.package.yaml`;

    let existingData = null;
    if (fs.existsSync(path)) {
      existingData = yaml.load(path);
      existingData = existingData || {};
    }

    const license = await getLicense(resource.username, resource.repo);

    const data = {
      name: `${resource.username}/${resource.repo}`,
      description: existingData.description || resource.description,
      homepage: existingData.homepage || `https://github.com/${resource.username}/${resource.repo}`,
      repository: existingData.repository || `https://github.com/${resource.username}/${resource.repo}`,
      license: license || "unknown",
      category: existingData.category || resource.type,
      tags: existingData.tags || resource.tags,
    }
    if (existingData.media) {
      data.media = existingData.media;
    }

    if (!fs.existsSync(`packages/${resource.username}/${resource.repo}`)) {
      fs.mkdirSync(`packages/${resource.username}/${resource.repo}`, {
        recursive: true,
      });
    }

    const yamlData = yaml.dump(data, {
      lineWidth: -1,
      noCompatMode: true,
    });
    fs.writeFileSync(path, yamlData, "utf8");
  }
}

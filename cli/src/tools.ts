import * as fs from "fs";
import * as path from "path";
import { FileContext, ToolResult } from "./types";

const MAX_CONTENT_LENGTH = 4000; // limit per file to avoid token overflow
const MAX_SEARCH_RESULTS = 50;

export function readFile(filePath: string): ToolResult {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return { tool_name: "read_file", input: filePath, output: content };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { tool_name: "read_file", input: filePath, output: "", error: message };
  }
}

export function listDirectory(dirPath: string, maxDepth: number = 3): ToolResult {
  try {
    const lines: string[] = [];
    function walk(dir: string, depth: number): void {
      if (depth > maxDepth) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "__pycache__") continue;
        const indent = "  ".repeat(depth);
        lines.push(`${indent}${entry.isDirectory() ? "📁" : "📄"} ${entry.name}`);
        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name), depth + 1);
        }
      }
    }
    walk(dirPath, 0);
    return { tool_name: "list_directory", input: dirPath, output: lines.join("\n") };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { tool_name: "list_directory", input: dirPath, output: "", error: message };
  }
}

export function collectFiles(dirPath: string, extensions: string[] = [".ts", ".js", ".py", ".md", ".json"]): FileContext[] {
  const results: FileContext[] = [];
  function walk(dir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "__pycache__" || entry.name === "dist") continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          results.push({ path: fullPath, content: content.slice(0, MAX_CONTENT_LENGTH) });
        } catch {
          // skip unreadable files
        }
      }
    }
  }
  walk(dirPath);
  return results;
}

export function searchCode(dirPath: string, query: string): ToolResult {
  const files = collectFiles(dirPath, [".ts", ".js", ".py", ".md", ".json", ".txt"]);
  const queryLower = query.toLowerCase();
  const matches: string[] = [];
  for (const file of files) {
    const lines = file.content.split("\n");
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(queryLower)) {
        matches.push(`${file.path}:${idx + 1}: ${line.trim()}`);
      }
    });
  }
  const output = matches.length > 0
    ? matches.slice(0, MAX_SEARCH_RESULTS).join("\n")
    : `No matches found for "${query}"`;
  return { tool_name: "search_code", input: query, output };
}

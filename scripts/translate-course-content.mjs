import fs from "node:fs/promises";

const inputPath = "assets/data/course_content.json";
const backupPath = "assets/data/course_content.en.json";

const data = JSON.parse(await fs.readFile(inputPath, "utf8"));
await fs.copyFile(inputPath, backupPath);

const translate = async (text) => {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", "vi");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
  const result = await response.json();
  return result[0].map((part) => part[0]).join("");
};

const fields = new Set([
  "title",
  "english",
  "breakdown",
  "description",
  "goal",
]);
const cache = new Map();
const values = [];

const collect = (value, key = "") => {
  if (Array.isArray(value)) {
    value.forEach((item) => collect(item, key));
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [childKey, childValue] of Object.entries(value)) {
    if (fields.has(childKey) && typeof childValue === "string") {
      values.push(childValue);
    } else if (childKey === "tasks" && Array.isArray(childValue)) {
      childValue.forEach((task) => values.push(task));
    } else {
      collect(childValue, childKey);
    }
  }
};

collect(data);
for (const value of [...new Set(values)]) {
  if (/[^\x00-\x7F]/.test(value) || !/[A-Za-z]/.test(value)) {
    cache.set(value, value);
    continue;
  }
  cache.set(value, await translate(value));
}

const replace = (value, key = "") => {
  if (Array.isArray(value)) return value.map((item) => replace(item, key));
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([childKey, childValue]) => {
      if (fields.has(childKey) && typeof childValue === "string") {
        return [childKey, cache.get(childValue) ?? childValue];
      }
      if (childKey === "tasks" && Array.isArray(childValue)) {
        return [childKey, childValue.map((task) => cache.get(task) ?? task)];
      }
      return [childKey, replace(childValue, childKey)];
    }),
  );
};

await fs.writeFile(
  inputPath,
  `${JSON.stringify(replace(data), null, 2)}\n`,
  "utf8",
);
console.log(`Translated ${cache.size} unique content strings.`);

// Structural sanity check for the Prisma schema without running the Prisma CLI.
// Catches the errors that actually bite: a relation field whose target model has
// no matching back-reference, an unknown type, or a dangling enum.
import { readFileSync } from "node:fs";

const src = readFileSync("prisma/schema.prisma", "utf8");
const models = new Map();
const enums = new Set();

const modelRe = /^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm;
const enumRe = /^enum\s+(\w+)\s*\{/gm;
for (const m of src.matchAll(enumRe)) enums.add(m[1]);
for (const m of src.matchAll(modelRe)) models.set(m[1], m[2]);

const SCALARS = new Set(["String","Int","Float","Boolean","DateTime","Json","Bytes","Decimal","BigInt"]);
const problems = [];
const fieldsOf = (body) =>
  body.split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("///") && !l.startsWith("@@"))
    .map((l) => {
      const m = l.match(/^(\w+)\s+([\w\[\]?]+)(.*)$/);
      return m ? { name: m[1], type: m[2], rest: m[3] ?? "" } : null;
    })
    .filter(Boolean);

let relationCount = 0;
for (const [model, body] of models) {
  for (const f of fieldsOf(body)) {
    const base = f.type.replace(/[\[\]?]/g, "");
    if (SCALARS.has(base) || enums.has(base)) continue;
    if (!models.has(base)) { problems.push(`${model}.${f.name}: unknown type ${base}`); continue; }
    relationCount++;
    // Named relations must pair up; unnamed ones need some field back.
    const nameMatch = f.rest.match(/@relation\(\s*"([^"]+)"/);
    const target = fieldsOf(models.get(base));
    const back = nameMatch
      ? target.filter((t) => t.type.replace(/[\[\]?]/g, "") === model && t.rest.includes(`"${nameMatch[1]}"`))
      : target.filter((t) => t.type.replace(/[\[\]?]/g, "") === model && !/@relation\(\s*"/.test(t.rest));
    if (back.length === 0) {
      problems.push(`${model}.${f.name} -> ${base}${nameMatch ? ` ("${nameMatch[1]}")` : ""}: no back-reference on ${base}`);
    }
  }
}

console.log(`models ${models.size} | enums ${enums.size} | relation fields ${relationCount}`);
if (problems.length) { console.log("\nPROBLEMS:"); for (const p of problems) console.log(" -", p); process.exit(1); }
console.log("relation graph: every relation field has a matching back-reference");

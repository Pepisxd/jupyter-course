// Asigna `order` a cada Chapter según una palabra clave en el título.
// Uso:
//   MONGO_URI="mongodb://..." node scripts/migrate-chapter-order.js
//   MONGO_URI="mongodb://..." node scripts/migrate-chapter-order.js --dry-run

require("dotenv").config();
const { MongoClient } = require("mongodb");

// Mapeo canónico: palabra clave (lowercase, sin acentos) -> order
const ORDER_BY_KEYWORD = [
  { keyword: "introduccion", order: 1 },
  { keyword: "instalacion", order: 2 },
  { keyword: "multiples lenguajes", order: 3 },
  { keyword: "compartir", order: 4 },
  { keyword: "salidas interactivas", order: 5 },
  { keyword: "big data", order: 6 },
];

const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const resolveOrder = (title) => {
  const norm = normalize(title);
  for (const { keyword, order } of ORDER_BY_KEYWORD) {
    if (norm.includes(keyword)) return order;
  }
  return null;
};

(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Falta MONGO_URI en el entorno");
    process.exit(1);
  }
  const dryRun = process.argv.includes("--dry-run");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const chaptersCol = db.collection("chapters");
  console.log(`Conectado a db=${db.databaseName}`);
  console.log(dryRun ? "Modo: DRY RUN (no escribe)" : "Modo: APPLY");

  const chapters = await chaptersCol.find({}).toArray();
  console.log(`Encontrados ${chapters.length} capítulos`);

  const unresolved = [];
  for (const c of chapters) {
    const order = resolveOrder(c.title);
    if (order == null) {
      unresolved.push(c.title);
      console.log(`  [SKIP] "${c.title}" -> sin match`);
      continue;
    }
    console.log(`  ${c.title}  ->  order=${order}`);
    if (!dryRun) {
      // Usa el _id tal cual está en la DB (string u ObjectId) para evitar mismatch
      const r = await chaptersCol.updateOne(
        { _id: c._id },
        { $set: { order } }
      );
      if (r.matchedCount === 0) {
        console.warn(`    [WARN] no match para _id=${c._id}`);
      }
    }
  }

  if (unresolved.length > 0) {
    console.warn(
      `\nADVERTENCIA: ${unresolved.length} capítulo(s) sin match — ajusta ORDER_BY_KEYWORD si es necesario.`
    );
  }

  const result = await chaptersCol
    .find({}, { projection: { title: 1, order: 1 } })
    .sort({ order: 1, createdAt: 1 })
    .toArray();
  console.log("\nOrden resultante:");
  result.forEach((c, i) =>
    console.log(`  ${i + 1}. (order=${c.order ?? "—"}) ${c.title}`)
  );

  await client.close();
  process.exit(0);
})().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

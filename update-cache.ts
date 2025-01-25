import fs from "fs";
import { fetchAll, totals, mergeGeoJSON } from "@/lib/nfd";
import type { NfdRecordCollection } from "src/lib/nfd/client";
import type { FeatureCollection } from "geojson";

let data: NfdRecordCollection;
// Fetch the NFD data
if (fs.existsSync("./.db/db.json") && process.env.FORCE_DOWNLOAD !== "true") {
  data = JSON.parse(fs.readFileSync("./.db/db.json", "utf8"));
} else {
  const total = await totals();
  data = await fetchAll(total.total);

  // Backup data
  fs.writeFileSync("./db/db.json", JSON.stringify(data, null, 2));
}

// Get the cache
import geo from "./src/db/geo.json";
// Update the resources
const geoJson = await mergeGeoJSON(data, geo as FeatureCollection);

geoJson.features = geoJson.features.filter(
  (pin) =>
    pin.geometry.coordinates[0] !== 0 && pin.geometry.coordinates[1] !== 0,
);
fs.writeFileSync("./.db/geo.json", JSON.stringify(geoJson, null, 2));

import { isValidAddress } from "algosdk";
import type { NfdRecord, NfdRecordCollection } from "@/lib/nfd/client";
import type { FeatureCollection } from "geojson";
import {
  geolocate,
  getGeoJSONProperties,
  type OpenStreetResponse,
} from "@/lib/nfd/geocoder.ts";
import * as turf from "@turf/turf";

export async function mergeGeoJSON(
  collection: NfdRecordCollection,
  geoJson: FeatureCollection,
) {
  console.log(
    `Initializing ${collection.length} NFD records with ${geoJson.features.length} existing points`,
  );

  // Filter Collection
  collection = collection?.filter((record) => {
    // Find the addresses and make sure they are not account addresses
    const isValid =
      typeof record?.properties?.userDefined?.address === "string" &&
      !isValidAddress(record.properties.userDefined.address);
    if (isValid) {
      console.log(`Found address for ${record.name}`);
    }
    return isValid;
  });

  // Split the dataset
  const clean: NfdRecordCollection = [];
  const dirty: NfdRecordCollection = [];
  collection.forEach((record) => {
    const matches = geoJson.features.filter((point) => {
      return (
        point.properties &&
        point.properties.name === record.name &&
        record.timeChanged === point.properties.timeChanged
      );
    });
    if (matches.length > 0) {
      console.log(`Record is clean for ${record.name}`);
      clean.push(record);
    } else {
      console.log(`Record is dirty for ${record.name}`);
      dirty.push(record);
    }
  });

  // Get the geolocation records
  const dirtyPins = (
    await Promise.all(
      dirty.map(async (record) =>
        geolocate(record.properties?.userDefined?.address || ""),
      ),
    )
  )
    // Filter any missing place matches
    .map((r) => {
      if (typeof r.lon !== "undefined") {
        return turf.point([parseFloat(r.lon), parseFloat(r.lat)]);
      }
      return turf.point([0, 0]);
    });

  dirtyPins.forEach((pin, k) => {
    const dirtyRecord = dirty[k];
    let found = false;
    if (
      pin.geometry.coordinates[0] !== 0 &&
      pin.geometry.coordinates[1] !== 0
    ) {
      geoJson.features.forEach((feat, i) => {
        if (!feat.properties) return;
        if (dirtyRecord.name === feat.properties.name) {
          found = true;
          geoJson.features[i] = {
            ...pin,
            properties: {
              ...pin.properties,
              ...feat.properties,
            },
          };
        }
      });
      if (!found) {
        console.log("not found");
        geoJson.features.push(pin);
      }
    }
  });
  // TODO: FIX THIS
  // Get all of the properties from IPFS
  const properties = await Promise.all(
    collection.map((record) => getGeoJSONProperties(record)),
  );

  geoJson.features = geoJson.features.map((feat, i) => {
    return {
      ...feat,
      properties: properties[i],
    };
  });
  return geoJson;
}

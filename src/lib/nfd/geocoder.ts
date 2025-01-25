import type { NfdRecord } from "@/lib/nfd/client";
import {
  getBackgroundUrl,
  getIconUrl,
  isBackgroundVerified,
  isIconVerified,
} from "@/lib/nfd/images.ts";
import { sleep } from "@/lib/nfd/time.ts";
// Mutext for the GeoJSON fetcher
import { Mutex } from "async-mutex";
import { checkArcIPFS } from "@/lib/nfd/ipfs.ts";
const mutex = new Mutex();

export type OpenStreetResponse = {
  place_id: number;
  licence: "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright";
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: string[];
};

export async function getGeoJSONProperties(nfd: NfdRecord) {
  const iconVerified = isIconVerified(nfd.properties);
  let iconUrl = getIconUrl(nfd.properties);
  if (
    iconUrl.includes("https://ipfs.algonode") ||
    iconUrl.includes("ipfs://")
  ) {
    iconUrl = await checkArcIPFS(iconUrl);
  }
  const backgroundVerified = isBackgroundVerified(nfd.properties);
  let backgroundUrl = getBackgroundUrl(nfd.properties);
  if (
    backgroundUrl.includes("https://ipfs.algonode") ||
    backgroundUrl.includes("ipfs://")
  ) {
    backgroundUrl = await checkArcIPFS(backgroundUrl);
  }

  return {
    name: nfd.name,
    // for simplestyle-spec services like geojson.io
    "marker-color": "#ff602e",

    timeChanged: nfd.timeChanged,

    // Custom Icons for Render
    iconUrl,
    iconVerified,
    backgroundUrl,
    backgroundVerified,
  };
}

/**
 * Geocode address string
 * @param address
 */
export async function geolocate(address: string): Promise<OpenStreetResponse> {
  return mutex.runExclusive(async () => {
    console.log(
      "Mutex Gained Lock",
      `https://nominatim.openstreetmap.org/search?format=json&q="${address}"`,
    );
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q="${address}"`,
      {
        headers: {
          "User-Agent": "Tacticalgo Map",
        },
      },
    ).then(async (r) => {
      if (r.status !== 200) {
        console.log(await r.text());
        const sleepSeconds = 3;
        console.log(`Rate limited, sleeping for ${sleepSeconds} seconds`);
        await sleep(sleepSeconds * 1000);
        console.log(
          "Mutex Still Locked",
          `https://nominatim.openstreetmap.org/search?format=json&q="${address}"`,
        );
        return await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q="${address}"`,
          {
            headers: {
              "User-Agent": "Tacticalgo Map",
            },
          },
        ).then((r) => r.json());
      } else {
        return r.json();
      }
    });

    if (res.length > 0 && res[0].importance > 0.5) {
      return res[0];
    } else {
      return {};
    }
  });
}

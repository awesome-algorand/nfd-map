import { isValidAddress } from "algosdk";
import { Mutex } from "async-mutex";
import { nfdBrowse, type NfdRecordCollection } from "@/lib/nfd/client";
import { sleep } from "@/lib/nfd/time.ts";

// NFD Api and Mutex
export const BASE_URL = "https://api.nf.domains";
const mutex = new Mutex();

/**
 * Retrieves detailed information about a domain name or ID from the API.
 *
 * @param {string} nameOrID - The name or ID of the domain to fetch information for.
 * @return {Promise<Object>} A promise that resolves to the JSON response containing the domain information.
 */
export async function get(nameOrID: string) {
  return mutex.runExclusive(async () => {
    const r = await fetch(`https://api.nf.domains/nfd/${nameOrID}?view=full`);
    return await r.json();
  });
}

type BrowseProps = {
  limit?: number;
  offset?: number;
  sort?: "createdDesc";
  view?: "full";
};
export async function totals() {
  return await fetch(`https://api.nf.domains/nfd/totals`).then((r) => r.json());
}
export async function browse({
  limit = 200,
  offset = 0,
  sort = "createdDesc",
  view = "full",
}: BrowseProps) {
  return mutex.runExclusive(async () => {
    console.log(
      "Mutex Gained Lock",
      `https://api.nf.domains/nfd/browse?limit=${limit}&offset=${offset}&sort=${sort}&view=${view}`,
    );
    let collection: NfdRecordCollection = [];
    const {
      response: r,
      data,
      error,
    } = await nfdBrowse({
      query: {
        limit,
        offset,
        view,
      },
      baseUrl: BASE_URL,
    });

    // Check for response data
    if (typeof data !== "undefined" && typeof error === "undefined") {
      collection = data;
    }

    // Handle Rate Limits and all other errors
    if (r.status === 429 || typeof error !== "undefined") {
      const errRes = error as { secsRemaining?: number };
      console.log(
        `Rate limited, sleeping for ${errRes?.secsRemaining} seconds`,
      );
      await sleep((errRes?.secsRemaining || 1) * 1000 + 1000);
      console.log(
        "Mutex Still Locked, trying again",
        `https://api.nf.domains/nfd/browse?limit=${limit}&offset=${offset}&sort=${sort}&view=${view}`,
      );
      const { response: r, data } = await nfdBrowse({
        query: {
          limit,
          offset,
          view,
        },
        baseUrl: BASE_URL,
      });
      if (typeof data !== "undefined") {
        collection = data;
      }
      if (r.status !== 200) {
        throw new Error("rekd, we are only going to retry once");
      }
    }

    return collection;
  });
}

/**
 * Fetches all records by dividing the total number into chunks of 200 and retrieving each chunk sequentially.
 *
 * @param {number} total - The total number of records to be fetched.
 * @return {Promise<NfdRecordCollection>} A promise that resolves to the collection of all fetched records.
 */
export async function fetchAll(total: number) {
  const blocks = total / 200;
  let uploads: NfdRecordCollection = [];
  // Chunk the requests
  for (let i = 0; i < blocks; i++) {
    const docs = await browse({ offset: i * 200 });
    uploads = [...uploads, ...docs];
  }
  return uploads;
}

export async function fetchOwned(address: string) {
  return mutex.runExclusive(async () => {
    const r = await fetch(
      `https://api.nf.domains/nfd/v2/search?owner=${address}&view=full`,
    );
    const json = await r.json();
    return json.nfds;
  });
}

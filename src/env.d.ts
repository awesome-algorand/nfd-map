import * as Leaf from "leaflet";
declare global {
  type L = Leaf;
  type Window = {
    map: L.Map;
    __GEO_JSON__: any;
  };
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

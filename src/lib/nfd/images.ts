import type { NfdProperties } from "src/lib/nfd/client";

export function isIconVerified(properties?: NfdProperties) {
  return (
    typeof properties?.verified?.avatar === "string" &&
    typeof properties?.userDefined?.avatar == "undefined"
  );
}

export function getIconUrl(properties?: NfdProperties) {
  // https://ipfs.algonode.xyz/ipfs/$%7Bcid%7D
  if (typeof properties?.verified?.avatar === "string") {
    return properties.verified.avatar.replace(
      "ipfs://",
      "https://ipfs.algonode.xyz/ipfs/",
    );
  }

  if (typeof properties?.userDefined?.avatar == "string") {
    return properties.userDefined.avatar;
  }

  return "/nfd.png";
}

export function isBackgroundVerified(properties?: NfdProperties) {
  return (
    typeof properties?.verified?.background === "string" &&
    typeof properties?.userDefined?.background == "undefined"
  );
}

export function getBackgroundUrl(properties?: NfdProperties) {
  // https://ipfs.algonode.xyz/ipfs/$%7Bcid%7D
  if (typeof properties?.verified?.banner === "string") {
    return properties.verified.banner.replace(
      "ipfs://",
      "https://ipfs.algonode.xyz/ipfs/",
    );
  }

  if (typeof properties?.userDefined?.banner == "string") {
    return properties.userDefined.banner;
  }

  return "/nfd.png";
}

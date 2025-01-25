export async function checkArcIPFS(cidUrl: string) {
  let url = cidUrl.replace("ipfs://", "https://ipfs.algonode.xyz/ipfs/");
  const resp = await fetch(url);
  const contentType = resp.headers.get("content-type");
  if (contentType && contentType === "application/json") {
    const json = await resp.json();
    if (typeof json.image !== "undefined") {
      url = json.image.replace("ipfs://", "https://ipfs.algonode.xyz/ipfs/");
    }
  }
  return url;
}

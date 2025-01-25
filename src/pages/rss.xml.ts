import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION, ENABLE_BLOG } from "@/consts";

export const GET: APIRoute = async (context) => {
  if (!ENABLE_BLOG) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }
  const posts = await getCollection("blog");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site || "",
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.id}/`,
    })),
  });
};

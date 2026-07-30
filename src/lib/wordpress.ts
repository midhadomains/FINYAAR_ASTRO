const WORDPRESS_API_URL = import.meta.env.WORDPRESS_API_URL ?? "https://cms.finyaar.com/index.php?graphql";

export interface WPImage {
  sourceUrl: string;
  altText: string;
}

export interface WPAuthor {
  name: string;
}

export interface WPCategory {
  name: string;
  slug: string;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage: WPImage | null;
  author: WPAuthor | null;
  categories: WPCategory[];
}

export interface BlogPost extends BlogPostSummary {
  content: string;
}

interface RawPostNode {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string | null;
  content?: string | null;
  featuredImage: { node: WPImage } | null;
  author: { node: WPAuthor } | null;
  categories: { nodes: WPCategory[] } | null;
}

const POST_SUMMARY_FIELDS = `
  id
  title
  slug
  date
  excerpt
  featuredImage {
    node {
      sourceUrl
      altText
    }
  }
  author {
    node {
      name
    }
  }
  categories {
    nodes {
      name
      slug
    }
  }
`;

async function fetchGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(WORDPRESS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`WordPress GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const { data, errors } = (await response.json()) as { data: T; errors?: { message: string }[] };

  if (errors?.length) {
    throw new Error(`WordPress GraphQL error: ${errors.map((e) => e.message).join(", ")}`);
  }

  return data;
}

function normalizePost(node: RawPostNode): BlogPostSummary {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    date: node.date,
    excerpt: node.excerpt ?? "",
    featuredImage: node.featuredImage?.node ?? null,
    author: node.author?.node ?? null,
    categories: node.categories?.nodes ?? [],
  };
}

export async function getAllPosts(): Promise<BlogPostSummary[]> {
  const query = `
    query GetAllPosts {
      posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
        nodes {
          ${POST_SUMMARY_FIELDS}
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ posts: { nodes: RawPostNode[] } }>(query);
  return data.posts.nodes.map(normalizePost);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function formatPostDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getAllPostSlugs(): Promise<string[]> {
  const query = `
    query GetAllPostSlugs {
      posts(first: 100) {
        nodes {
          slug
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ posts: { nodes: { slug: string }[] } }>(query);
  return data.posts.nodes.map((node) => node.slug);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const query = `
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        ${POST_SUMMARY_FIELDS}
        content
      }
    }
  `;

  const data = await fetchGraphQL<{ post: RawPostNode | null }>(query, { slug });

  if (!data.post) return null;

  return {
    ...normalizePost(data.post),
    content: data.post.content ?? "",
  };
}

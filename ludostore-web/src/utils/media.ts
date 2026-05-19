const apiBaseUrl = import.meta.env.VITE_BACKEND_API_URL || "";
const backendBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, "");

export const resolveMediaUrl = (path?: string | null) => {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendBaseUrl}${normalizedPath}`;
};

export const resolveMediaUrlOrPlaceholder = (
  path?: string | null,
  placeholder = "https://via.placeholder.com/500x500?text=No+Image",
) => resolveMediaUrl(path) || placeholder;

export const getProductImagePath = (
  image?: { image?: string | null; image_url?: string | null } | null,
) => image?.image_url || image?.image || "";

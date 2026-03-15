const RECIPE_CDN_HOST = 'cdn.fitpilot.fit';

export const RECIPE_CDN_BASE_URL = `https://${RECIPE_CDN_HOST}`;

const ABSOLUTE_HTTP_URL_PATTERN = /^https?:\/\//i;
const INLINE_IMAGE_URL_PATTERN = /^(?:blob:|data:)/i;

const encodeObjectKey = (key: string) =>
    key
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');

const normalizeRecipeObjectKey = (value: string): string | null => {
    const normalizedValue = value.trim().replace(/^\/+/, '');
    if (!normalizedValue) {
        return null;
    }

    if (normalizedValue.startsWith('recipes/')) {
        return normalizedValue;
    }

    const segments = normalizedValue.split('/').filter(Boolean);
    const recipeSegmentIndex = segments.findIndex((segment) => segment === 'recipes');
    if (recipeSegmentIndex === -1) {
        return null;
    }

    return segments.slice(recipeSegmentIndex).join('/');
};

const decodePathname = (pathname: string) =>
    pathname
        .split('/')
        .filter(Boolean)
        .map((segment) => {
            try {
                return decodeURIComponent(segment);
            } catch {
                return segment;
            }
        })
        .join('/');

const buildRecipeCdnUrl = (objectKey: string) => `${RECIPE_CDN_BASE_URL}/${encodeObjectKey(objectKey)}`;

const isCloudflareRecipeHost = (hostname: string) => hostname.toLowerCase() === RECIPE_CDN_HOST;

const isLegacyR2RecipeHost = (hostname: string) => {
    const normalizedHost = hostname.toLowerCase();
    return (
        normalizedHost.endsWith('.r2.dev') ||
        normalizedHost.endsWith('.r2.cloudflarestorage.com')
    );
};

export const resolveRecipeImageUrl = (value: string | null | undefined): string | null => {
    if (typeof value !== 'string') {
        return null;
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
        return null;
    }

    if (INLINE_IMAGE_URL_PATTERN.test(normalizedValue)) {
        return normalizedValue;
    }

    if (!ABSOLUTE_HTTP_URL_PATTERN.test(normalizedValue)) {
        const objectKey = normalizeRecipeObjectKey(normalizedValue);
        return objectKey ? buildRecipeCdnUrl(objectKey) : null;
    }

    try {
        const parsedUrl = new URL(normalizedValue);
        const recipeObjectKey = normalizeRecipeObjectKey(decodePathname(parsedUrl.pathname));

        if (recipeObjectKey && (isCloudflareRecipeHost(parsedUrl.hostname) || isLegacyR2RecipeHost(parsedUrl.hostname))) {
            return buildRecipeCdnUrl(recipeObjectKey);
        }

        return parsedUrl.toString();
    } catch {
        return null;
    }
};

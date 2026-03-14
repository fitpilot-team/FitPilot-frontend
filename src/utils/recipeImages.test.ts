import { describe, expect, it } from 'vitest';
import { resolveRecipeImageUrl } from './recipeImages';

describe('resolveRecipeImageUrl', () => {
    it('builds a Cloudflare URL from an object key', () => {
        expect(resolveRecipeImageUrl('recipes/4/1/file.jpg')).toBe(
            'https://cdn.fitpilot.fit/recipes/4/1/file.jpg',
        );
    });

    it('rewrites legacy R2 URLs to Cloudflare', () => {
        expect(
            resolveRecipeImageUrl(
                'https://pub-1234.r2.dev/fitpilot-public/recipes/4/1/file.jpg?version=1',
            ),
        ).toBe('https://cdn.fitpilot.fit/recipes/4/1/file.jpg');
    });

    it('keeps Cloudflare recipe URLs canonical', () => {
        expect(
            resolveRecipeImageUrl('http://cdn.fitpilot.fit/recipes/4/1/file.jpg'),
        ).toBe('https://cdn.fitpilot.fit/recipes/4/1/file.jpg');
    });

    it('preserves local editor preview URLs', () => {
        expect(resolveRecipeImageUrl('blob:https://fitpilot.fit/preview')).toBe(
            'blob:https://fitpilot.fit/preview',
        );
        expect(resolveRecipeImageUrl('data:image/png;base64,abc123')).toBe(
            'data:image/png;base64,abc123',
        );
    });

    it('returns null for empty or invalid values', () => {
        expect(resolveRecipeImageUrl('')).toBeNull();
        expect(resolveRecipeImageUrl('   ')).toBeNull();
        expect(resolveRecipeImageUrl('not-a-valid-image')).toBeNull();
        expect(resolveRecipeImageUrl(null)).toBeNull();
    });
});

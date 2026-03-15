import { type ReactNode, useEffect, useState } from 'react';
import { ChefHat } from 'lucide-react';
import { resolveRecipeImageUrl } from '@/utils/recipeImages';

interface RecipeImageProps {
    src?: string | null;
    alt: string;
    imageClassName?: string;
    fallbackClassName?: string;
    iconClassName?: string;
    fallback?: ReactNode;
}

export function RecipeImage({
    src,
    alt,
    imageClassName,
    fallbackClassName,
    iconClassName,
    fallback,
}: RecipeImageProps) {
    const [resolvedSrc, setResolvedSrc] = useState<string | null>(() => resolveRecipeImageUrl(src));

    useEffect(() => {
        setResolvedSrc(resolveRecipeImageUrl(src));
    }, [src]);

    if (resolvedSrc) {
        return (
            <img
                src={resolvedSrc}
                alt={alt}
                className={imageClassName}
                onError={() => setResolvedSrc(null)}
            />
        );
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className={fallbackClassName}>
            <ChefHat className={iconClassName} />
        </div>
    );
}

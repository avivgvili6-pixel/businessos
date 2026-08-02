import React, { useState } from 'react'
import { recipePhotoUrl, recipeFallbackGradient } from '../../data/recipeImages'
import { t } from '../../theme/tokens'

// Thumbnail image for a recipe — Unsplash source URL with a
// deterministic sig so the same recipe always shows the same photo.
// Falls back to a colored gradient if the image fails to load.

export function RecipeThumb({ recipe, aspectRatio = '4 / 3', style }) {
  const [failed, setFailed] = useState(false)
  const url = recipePhotoUrl(recipe)
  const fallback = recipeFallbackGradient(recipe)

  return (
    <div style={{
      position: 'relative',
      width: '100%', aspectRatio,
      background: fallback,
      borderRadius: t.radius.md,
      overflow: 'hidden',
      ...style,
    }}>
      {!failed && url && (
        <img
          src={url}
          alt={recipe.name || ''}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}
      {/* Bottom gradient scrim so text on top stays legible if used */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

import { useMemo } from 'react';

export const AVATAR_OPTIONS = {
  GENDERS: ['girl', 'boy'],
  SKIN_COLORS: ['#FFDFC4', '#F0C8A0', '#D89870', '#8D5B4C', '#5C382B'],
  HAIR_COLORS: ['#2D232A', '#333333', '#5A3D31', '#FF99B0', '#F5D061', '#5B8DEF', '#A06CD5'],
  HAIR_STYLES: ['long', 'bob', 'twin_tails', 'spiky', 'slick_back', 'crew_cut', 'side_part', 'fluffy', 'cap'],
  OUTFIT_COLORS: ['#262427', '#FFB5C2', '#A4C8E1', '#F5E6A4', '#B8D8BA', '#E0D4F5'],
  EYE_STYLES: ['sparkle', 'happy', 'wink', 'cool'],
  ACCESSORIES: ['none', 'bow', 'glasses', 'blush_star']
};

export default function PixelAvatar({ config = {}, size = 80, onClick, className = '' }) {
  const gender = config?.gender || 'girl';
  const skinColor = config?.skinColor || AVATAR_OPTIONS.SKIN_COLORS[0];
  const hairColor = config?.hairColor || AVATAR_OPTIONS.HAIR_COLORS[0];
  const hairStyle = config?.hairStyle || (gender === 'boy' ? 'spiky' : 'twin_tails');
  const outfitColor = config?.outfitColor || AVATAR_OPTIONS.OUTFIT_COLORS[0];
  const eyeStyle = config?.eyeStyle || 'sparkle';
  const accessory = config?.accessory || (gender === 'girl' ? 'bow' : 'none');

  // Grid dimensions: 16x16 pixel matrix
  const pixelGrid = useMemo(() => {
    const grid = Array(16).fill(null).map(() => Array(16).fill(null));

    const fill = (x, y, color) => {
      if (x >= 0 && x < 16 && y >= 0 && y < 16) {
        grid[y][x] = color;
      }
    };

    const fillRect = (x, y, w, h, color) => {
      for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
          fill(i, j, color);
        }
      }
    };

    const outlineColor = '#2D1B2D'; // Dark retro pixel border
    const hColor = hairColor;
    const hDark = outlineColor;

    // --- 1. BACK HAIR (Drawn FIRST behind body, shoulders & head) ---
    if (gender === 'boy') {
      // Boy: Short ear-length hair positioned mainly at back and sides (eyes/forehead remain 100% open)
      fillRect(3, 2, 10, 3, hColor); // Short back hair dome
      fillRect(3, 3, 1, 4, hColor);  // Ear-length side hair left
      fillRect(12, 3, 1, 4, hColor); // Ear-length side hair right
    } else if (hairStyle === 'long') {
      // Wavy long hair falling behind shoulders & framing sides (matching reference image)
      fillRect(2, 2, 12, 12, hColor); // Full hair volume
      fillRect(1, 4, 14, 10, hColor); // Wide side waves
      // Bottom wavy tips
      fill(1, 14, hColor); fill(3, 14, hColor);
      fill(12, 14, hColor); fill(14, 14, hColor);
    } else if (hairStyle === 'bob') {
      fillRect(2, 3, 12, 7, hColor);  // Bob hair behind back
      fillRect(1, 5, 14, 5, hColor);
    } else if (hairStyle === 'twin_tails') {
      fillRect(3, 2, 10, 4, hColor);
      fillRect(1, 4, 3, 7, hColor); // Left tail
      fill(2, 3, '#FF4466'); // Left ribbon
      fillRect(12, 4, 3, 7, hColor); // Right tail
      fill(13, 3, '#FF4466'); // Right ribbon
    }

    // --- 2. BODY & OUTFIT (Drawn OVER back hair so body/shoulders are in front) ---
    // Neck
    fillRect(7, 10, 2, 1, skinColor);

    // Outfit / Dress
    fillRect(4, 11, 8, 4, outfitColor);
    fillRect(3, 12, 10, 3, outfitColor);
    // Outfit outline
    fillRect(3, 11, 1, 4, outlineColor);
    fillRect(12, 11, 1, 4, outlineColor);
    fillRect(4, 15, 8, 1, outlineColor);

    // White Ribbon Collar & Cuffs (Matching reference image black dress)
    if (gender === 'girl') {
      fillRect(6, 11, 4, 1, '#FFFFFF'); // White collar
      fill(7, 12, '#FFFFFF'); fill(8, 12, '#FFFFFF'); // Ribbon knot
      fill(7, 13, '#FFFFFF'); fill(8, 14, '#FFFFFF'); // Draping ribbon tail
      fill(3, 13, '#FFFFFF'); fill(12, 13, '#FFFFFF'); // White sleeve cuffs
    } else {
      fillRect(7, 11, 2, 3, outlineColor); // Tie / Hoodie zip
      fillRect(7, 11, 2, 1, '#FFFFFF');
    }

    // --- 3. FACE & HEAD BASE (Drawn OVER back hair so face & cheeks are clean) ---
    fillRect(4, 4, 8, 6, skinColor); // Clean face: rows 4..9, cols 4..11

    // Pearl Earrings (White pearls on sides - Row 7)
    if (gender === 'girl') {
      fill(3, 7, '#FFFFFF'); fill(12, 7, '#FFFFFF');
    }

    // Side face outline (Jawline)
    fill(4, 9, outlineColor); fill(11, 9, outlineColor);
    fillRect(5, 10, 6, 1, outlineColor); // Chin outline

    // --- 4. EYES, BLUSH & MOUTH ---
    if (eyeStyle === 'wink') {
      fill(5, 7, outlineColor); fill(6, 7, outlineColor);
      fill(9, 7, outlineColor);
    } else if (eyeStyle === 'happy') {
      fill(5, 6, outlineColor); fill(6, 6, outlineColor);
      fill(9, 6, outlineColor); fill(10, 6, outlineColor);
    } else if (eyeStyle === 'cool') {
      fillRect(4, 6, 8, 2, outlineColor);
      fill(5, 6, '#FFFFFF'); fill(9, 6, '#FFFFFF');
    } else { // Large anime sparkle eyes (Matching reference image)
      // Top eyeliner / lash
      fillRect(5, 5, 2, 1, outlineColor);
      fillRect(9, 5, 2, 1, outlineColor);
      // Eye pupils & sparkle catchlight
      fill(5, 6, outlineColor); fill(5, 7, outlineColor);
      fill(6, 6, '#FFFFFF'); fill(6, 7, outlineColor);
      fill(9, 6, outlineColor); fill(9, 7, outlineColor);
      fill(10, 6, '#FFFFFF'); fill(10, 7, outlineColor);
    }

    // Delicate Eyebrows (Row 4)
    if (gender === 'girl') {
      fill(5, 4, '#5E4C56'); fill(10, 4, '#5E4C56');
    }

    // Soft Pink Blush (Row 8)
    fill(4, 8, '#FFAAA5'); fill(11, 8, '#FFAAA5');

    // Lip / Mouth (Row 9)
    fill(7, 9, '#C86A77'); fill(8, 9, '#C86A77');

    // --- 5. TOP HAIR DOME & MIDDLE PART BANG ---
    if (hairStyle === 'spiky') {
      fillRect(4, 1, 8, 3, hColor);
      fill(3, 0, hColor); fill(6, -1, hColor); fill(9, 0, hColor);
    } else if (hairStyle === 'slick_back') {
      fillRect(4, 1, 8, 3, hColor);
      fillRect(3, 2, 10, 2, hColor);
    } else if (hairStyle === 'crew_cut') {
      fillRect(4, 2, 8, 2, hColor);
    } else if (hairStyle === 'side_part') {
      fillRect(4, 2, 8, 2, hColor);
    } else if (hairStyle === 'fluffy') {
      fillRect(3, 1, 10, 3, hColor);
      fill(2, 2, hColor); fill(13, 2, hColor);
    } else if (hairStyle === 'cap') {
      fillRect(3, 1, 10, 3, outfitColor);
      fillRect(2, 4, 12, 1, outlineColor); // Cap visor
      fill(7, 1, '#FFFFFF');
    } else {
      // Long / Bob / Twin Tails / Default Girl Hair:
      // Top hair dome (Rows 2..3)
      fillRect(4, 2, 8, 2, hColor);
      // Middle Part line at top
      fill(7, 2, outlineColor); fill(8, 2, outlineColor);
      // Small side curtain bangs (Row 4)
      fill(4, 4, hColor); fill(11, 4, hColor);
      // Delicate single front strand bang (Matching reference image)
      fill(7, 3, hColor); fill(7, 4, hColor);
    }

    // Outer Top Hair Outline (Row 1)
    if (hairStyle !== 'cap') {
      fillRect(4, 1, 8, 1, outlineColor);
      fill(3, 2, outlineColor); fill(12, 2, outlineColor);
    }

    // --- ACCESSORIES ---
    if (accessory === 'glasses') {
      // Cute Glasses
      fillRect(4, 6, 3, 2, 'rgba(255,255,255,0.4)');
      fillRect(9, 6, 3, 2, 'rgba(255,255,255,0.4)');
      fillRect(4, 6, 3, 1, outlineColor);
      fillRect(9, 6, 3, 1, outlineColor);
      fill(7, 6, outlineColor); // Bridge
    } else if (accessory === 'bow') {
      // Head Bow
      fill(10, 2, '#FF4477'); fill(11, 2, '#FF4477');
      fill(10, 1, '#FF6699'); fill(11, 3, '#FF6699');
    } else if (accessory === 'blush_star') {
      fill(3, 7, '#FFD700'); fill(12, 7, '#FFD700'); // Star cheeks
    }

    return grid;
  }, [gender, skinColor, hairColor, hairStyle, outfitColor, eyeStyle, accessory]);

  return (
    <div
      className={`pixel-avatar-container ${className}`}
      style={{
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        imageRendering: 'pixelated'
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        style={{ shapeRendering: 'crispEdges', width: '100%', height: '100%' }}
      >
        {pixelGrid.map((row, y) =>
          row.map((color, x) =>
            color ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={color}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

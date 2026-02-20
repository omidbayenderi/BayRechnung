// Utility to generate a harmonious, professional color palette
// Uses HSL manipulation for consistent aesthetics and accessibility

const hexToHsl = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
};

const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
};

// Generates theme object based on brand color
export const generateTheme = (brandColor = '#3b82f6', secondaryBrandColor = null, mode = 'light') => {
    // 1. Normalize and Parse Input
    const { h, s, l } = hexToHsl(brandColor);

    // 2. Adjust Primary for Visibility (if too light/dark)
    // Ensure primary has enough punch (saturation) and isn't too white/black
    const safeS = Math.max(s, 60); // Boost saturation if dull
    const safeL = Math.max(30, Math.min(l, 60)); // Clamp lightness between 30% and 60%

    const primary = hslToHex(h, safeS, safeL);

    // 3. Generate Semantic Variables
    // Darker shade for hover/active states
    const primaryDark = hslToHex(h, safeS, Math.max(10, safeL - 10));

    // Lighter shade for subtle backgrounds
    const primaryLight = `hsla(${h}, ${safeS}%, 95%, 1)`; // Very subtle tint
    const primaryMedium = `hsla(${h}, ${safeS}%, 85%, 1)`; // Medium tint for borders/accents

    // Secondary Color (Split Complementary - shift hue by 150deg or user defined)
    let secondary;
    if (secondaryBrandColor) {
        const { h: h2, s: s2, l: l2 } = hexToHsl(secondaryBrandColor);
        // Ensure visual consistency with primary
        const safeS2 = Math.max(s2, 50);
        const safeL2 = Math.max(30, Math.min(l2, 60));
        secondary = hslToHex(h2, safeS2, safeL2);
    } else {
        const h2 = (h + 150) % 360;
        secondary = hslToHex(h2, 50, 50); // Muted secondary
    }

    // Text Colors - Professional Slate/Gray scale
    // We avoid pure black (#000) for a more polished look
    const textPrimary = '#0f172a'; // Slate 900
    const textSecondary = '#475569'; // Slate 600
    const textMuted = '#94a3b8'; // Slate 400

    // Button Text Color Calculation (Improved Contrast Check)
    // We calculate relative luminance to be sure about contrast
    // formula: 0.299*R + 0.587*G + 0.114*B (Simple Perceived Brightness)
    // This is robust enough for UI buttons without full WCAG math
    // We already have r, g, b from hexToHsl logic if we refactor, but here we can just do a quick check on 'l'
    // Actually, 'l' in HSL is not luminance. Yellow at 50% L is much brighter than Blue at 50% L.
    // So we need to re-parse the hex we just generated or use the original one if valid.

    // Quick approximation based on Hue
    let isLight = false;
    // Yellow, Cyan, Green ranges tend to be light even at 50% L
    if (l > 70) isLight = true;
    else if (l > 50 && (h > 40 && h < 190)) isLight = true; // Yellows/Greens/Cyans

    const buttonTextColor = isLight ? '#0f172a' : '#ffffff';

    const base = {
        // Core Brand Colors
        primary: primary,
        primaryDark: primaryDark,
        primaryLight: primaryLight,
        primaryMedium: primaryMedium,
        secondary: secondary,

        // UI Structure
        background: mode === 'dark' ? '#0f172a' : '#ffffff',
        surface: mode === 'dark' ? '#1e293b' : '#ffffff', // Cards, panels
        surfaceHighlight: mode === 'dark' ? '#334155' : '#f8fafc', // Light backgrounds

        // Typography
        text: mode === 'dark' ? '#f1f5f9' : textPrimary,
        muted: mode === 'dark' ? '#94a3b8' : textSecondary,
        textLight: textMuted,

        // Components
        border: mode === 'dark' ? '#334155' : '#e2e8f0',
        buttonText: buttonTextColor,

        // Status
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
    };

    return base;
};

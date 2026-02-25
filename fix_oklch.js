const fs = require('fs');
const culori = require('culori');
const css = fs.readFileSync('src/app/globals.css', 'utf8');
const fixedCss = css.replace(/oklch\(([^)]+)\)/g, (match, contents) => {
    // contents might be "0.577 0.245 27.325" or "1 0 0 / 10%"
    let [color, alpha] = contents.split('/');
    let [l, c, h] = color.trim().split(' ').map(Number);
    alpha = alpha ? parseFloat(alpha.trim() ) / 100 : undefined;
    if (isNaN(h)) h = 0;
    
    // Convert to standard CSS color space (e.g., fallback to rgb or hsl)
    // culori parses 'oklch(l c h / alpha)' if formatted properly
    let parsed = culori.parse(match);
    if (!parsed) {
         // fallback manual parsing
         parsed = { mode: 'oklch', l, c, h, alpha: alpha };
    }
    let rgb = culori.rgb(parsed);
    if (!rgb) return match;
    let r = Math.round(rgb.r * 255);
    let g = Math.round(rgb.g * 255);
    let b = Math.round(rgb.b * 255);
    if (rgb.alpha !== undefined && rgb.alpha !== 1) {
         return `rgba(${r}, ${g}, ${b}, ${rgb.alpha})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
});
fs.writeFileSync('src/app/globals.css', fixedCss);
console.log('Converted OKLCH to RGB format successfully!');

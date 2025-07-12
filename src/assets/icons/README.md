# Icon Generation Instructions

Please generate the following icon sizes from your logo (src/assets/logo.svg):

## Required Icon Sizes:
- icon-72x72.png
- icon-96x96.png  
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Tools to generate icons:
1. **Online**: https://realfavicongenerator.net/
2. **CLI**: npm install -g pwa-asset-generator
3. **Manual**: Use any image editor to resize your logo

## Requirements:
- Use your logo with primary color #605DC8
- Ensure good contrast on both light and dark backgrounds
- Make icons maskable (add padding for safe area)

## Command example:
```bash
npx pwa-asset-generator src/assets/logo.svg src/assets/icons --background "#605DC8" --padding "10%"
```

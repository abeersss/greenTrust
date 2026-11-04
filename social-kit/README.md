# CyberAbeer social kit

Shared by the scheduled publishing runs for @drabeerss (Instagram) and Dr. Abeer's LinkedIn.

- `template.html`: approved carousel style (blue gradient, white cards, yellow accents, IBM Plex Sans Arabic + Oswald, RTL, 1080x1350). Copy it, keep the `<style>` block, replace the `<section class="slide" id="sN">` blocks.
- `render.py`: renders every slide section to `slideN.jpg`.

Setup in a fresh container:

    mkdir -p ~/work && cd ~/work
    npm install --no-save @fontsource/ibm-plex-sans-arabic @fontsource/oswald
    cp <repo>/social-kit/template.html slides.html   # then edit
    python3 <repo>/social-kit/render.py slides.html

Final images go in `design-system/public/media/social/YYYY-MM-DD-slug/` and are served at
`https://cyberabeer.com/media/social/YYYY-MM-DD-slug/slideN.jpg` after Vercel deploys the push.
Never overwrite or delete an existing folder: earlier posts link to those URLs.

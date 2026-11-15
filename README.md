# Birthday Cards

Two decks, two folders.

| Folder | Vibe |
|--------|------|
| [`own/`](own/) | Chromakopia (St. Birthday) + Call Me If You Get Famous |
| [`aei/`](aei/) | Valorant / cyberpunk protocol |

Root [`index.html`](index.html) links to both.

## Preview

```bash
python3 -m http.server 8080
```

- Hub: [http://localhost:8080](http://localhost:8080)
- own: [http://localhost:8080/own/](http://localhost:8080/own/)
- aei: [http://localhost:8080/aei/](http://localhost:8080/aei/)

## Personalize

- **own:** edit `CARD` in `own/chromakopia.js` or `own/cmiygl.js`. Photos live in `own/public/photos/`.
- **aei:** edit `CARD` in `aei/script.js` (name, message, closer). Optional loop: `aei/public/music.mp3`.

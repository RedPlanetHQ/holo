<img width="1344" height="768" alt="Gemini_Generated_Image_t088z9t088z9t088" src="https://github.com/user-attachments/assets/e3a98b9e-8cdb-4b28-8ee4-1b1664bced88" />

# Holo Personalities

This is a quick way to generate holos using [CORE](https://github.com/redplanethq/core). We built a minimal MDX generator using which you can generate your holo in 5 minutes, where people can chat with your digital version.

## Available Personalities

We currently have two personalities:

- **Paul Graham** - [pg.getcore.me](https://pg.getcore.me)
- **Y Combinator** - [yc.getcore.me](https://yc.getcore.me)

## Want a New Personality?

If you'd like to request a new digital personality, please [create an issue](../../issues/new/choose) using the "New Digital Version" template.

## Structure

```
.
├── holos/pg/          # Paul Graham personality
└── holos/yc/          # Y Combinator personality
```

## Getting Started

Each personality directory contains:
- `holo.json` - Configuration file for the HOLO personality
- `introduction.mdx` - Introduction page content
- `Dockerfile` - For deployment
- Image assets for the personality

See individual README files in each directory for more details:
- [Paul Graham (pg) README](./holos/pg/README.md)
- [Y Combinator (yc) README](./holos/yc/README.md)

## Disclaimer

⚠️ **Important**: The data used to create these digital personalities is taken from public sources. These digital versions are AI-generated representations and can make mistakes. They should not be considered as official or authoritative sources.

## Technologies

- [CORE](https://github.com/redplanethq/core) - Document generation and knowledge base system

# Holo Personalities

This is a quick way to generate holos using [HOLO](https://github.com/replanethq/holo) and [CORE](https://github.com/redplanethq/core). We built a minimal MDX generator using which you can generate your holo in 5 minutes, where people can chat with your digital version.

## Available Personalities

We currently have two personalities:

- **Paul Graham** - [pg.getcore.me](https://pg.getcore.me)
- **Y Combinator** - [yc.getcore.me](https://yc.getcore.me)

## Structure

```
.
├── pg/          # Paul Graham personality
└── yc/          # Y Combinator personality
```

## Getting Started

Each personality directory contains:
- `holo.json` - Configuration file for the HOLO personality
- `introduction.mdx` - Introduction page content
- `Dockerfile` - For deployment
- Image assets for the personality

See individual README files in each directory for more details:
- [Paul Graham (pg) README](./pg/README.md)
- [Y Combinator (yc) README](./yc/README.md)

## Disclaimer

⚠️ **Important**: The data used to create these digital personalities is taken from public sources. These digital versions are AI-generated representations and can make mistakes. They should not be considered as official or authoritative sources.

## Technologies

- [HOLO](https://github.com/replanethq/holo) - Framework for creating interactive digital personalities
- [CORE](https://github.com/redplanethq/core) - Document generation and knowledge base system

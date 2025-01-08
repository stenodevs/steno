<div align="center">
  <h1>Steno</h1>
  <p>A simple static site generator build with Deno</p>
</div>

## Features

- [x] Markdown support to generate HTML files
- [x] Customizable config and metas
- [x] Basic Frontmatter Support
- [x] Importing CSS and JS files
- [x] Short URLs
- [ ] Theme Support
- [ ] Live reload server
- [ ] CLI

## Usage

First you need to create a main file, for example `mod.ts`:

```ts
import { Steno } from '@steno/steno';

new Steno();
```

Next, you need to copy the following `deno.json` file:

```json
{
  "tasks": {
    "dev": "deno run -A --watch ./mod.ts dev",
    "build": "deno run -A ./mod.ts build"
  }
}
```

This way, you can easily run the main commands.

Once you have the main file and the `deno.json` file, you can create a `content` folder with your markdown files.

For example, you can create a `content/index.md` file:

```md
---
title: Home
---

# Hello World

Welcome to my blog. This is my first post. I hope you enjoy it. Yes.
```

Now, you can build the Steno project configuration:

1. Create a folder named `steno` inside the `content` folder.
2. Create a `config.yml` file inside the `steno` folder, for example:

```yml
title: Welcome to my blog
description: This is a blog about my life
author: John Doe

head:
  - name: icon
    content: /favicon.ico

custom:
  shortUrls: true
```

Finally, you can run the following command to build the project:

```sh
deno task build
```

This will generate the `dist` folder with the HTML files.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

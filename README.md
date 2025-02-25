# Vite React Template

A modern, feature-rich template for React applications built with Vite, TypeScript, and Tailwind CSS.

## Features

- ⚡️ [Vite](https://vitejs.dev/) - Lightning fast frontend tooling
- ⚛️ [React 18](https://reactjs.org/) - A JavaScript library for building user interfaces
- 🔒 [TypeScript](https://www.typescriptlang.org/) - Type safety for your JavaScript
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- 🧹 [ESLint](https://eslint.org/) - Linting for JavaScript and TypeScript
- 🐇 [Bun](https://bun.sh/) - Incredibly fast JavaScript runtime and package manager

## Getting Started

### Using this template

1. Clone this repository or use it as a template:
   ```bash
   # Clone the repository
   git clone https://github.com/RutgersGRID/vite-react-template.git my-project
   cd my-project

   # Or create a new repository from this template on GitHub
   # Then clone your new repository
   ```

2. Install dependencies:
   ```bash
   # Install with Bun
   bun install
   ```

3. Start the development server:
   ```bash
   # Run the dev server with Bun
   bun run dev
   ```

4. Open your browser and visit [http://localhost:5173](http://localhost:5173)

### Building for production

```bash
# With Bun
bun run build

# With npm
npm run build

# With yarn
yarn build
```

The build artifacts will be generated in the `dist` directory.

## Project Structure

```
vite-react-template/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── assets/          # Other assets like images
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind imports
├── .eslintrc.js         # ESLint configuration
├── .gitignore           # Git ignore rules
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
├── postcss.config.js    # PostCSS configuration for Tailwind
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── tsconfig.node.json   # Node-specific TypeScript config
└── vite.config.ts       # Vite configuration
```

## Customizing the Template

### Tailwind Configuration

Customize the Tailwind configuration in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add your custom theme extensions here
      colors: {
        // Custom colors
      },
      fontFamily: {
        // Custom fonts
      },
    },
  },
  plugins: [
    // Add Tailwind plugins here
  ],
}
```

### Adding New Dependencies

```bash
# With Bun
bun add package-name
bun add -d package-name # For dev dependencies

# With npm
npm install package-name
npm install --save-dev package-name # For dev dependencies

# With yarn
yarn add package-name
yarn add -D package-name # For dev dependencies
```

## License

[MIT](LICENSE)

## Acknowledgements

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Bun](https://bun.sh/)
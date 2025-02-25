# Vite React Template

A modern, feature-rich template for React applications built with Vite, TypeScript, and Tailwind CSS. The template includes a showcase HelloWorld component that demonstrates many of Tailwind CSS's powerful features, including responsive design, dark mode, grid layouts, flexbox, animations, and more.

## Features

- 🐇 [Bun](https://bun.sh/) - Incredibly fast JavaScript runtime, package manager, and test runner
- ⚡️ [Vite](https://vitejs.dev/) - Lightning fast frontend tooling
- ⚛️ [React 18](https://reactjs.org/) - A JavaScript library for building user interfaces
- 🔒 [TypeScript](https://www.typescriptlang.org/) - Type safety for your JavaScript
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- 🧹 [ESLint](https://eslint.org/) - Linting for JavaScript and TypeScript
- 🧪 [Bun Test](https://bun.sh/docs/cli/test) - Fast, built-in test runner

## Tailwind CSS Features Showcase

The template includes a comprehensive HelloWorld component that showcases many of Tailwind CSS's powerful features:

- **Theme Toggling**: Light/dark mode toggle with theme-specific styling
- **Responsive Design**: Mobile-first design that adapts to different screen sizes
- **Flexible Layouts**: Examples of both grid and flexbox layouts
- **Form Controls**: Styled inputs and dropdowns with focus states
- **Interactive Elements**: Buttons with hover and focus states
- **Transitions & Animations**: Including hover effects, scale transforms, and pulse animations
- **Typography Showcase**: Various text sizes, weights, and styles
- **Utility Classes**: Practical examples of Tailwind's utility-first approach

Click the "Show Tailwind Features" button in the demo component to explore all the included Tailwind CSS examples.

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
# Build for production with Bun
bun run build
```

The build artifacts will be generated in the `dist` directory.

### Running tests

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch
```

## Project Structure

```
vite-react-template/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── assets/          # Other assets like images
│   ├── utils/           # Utility functions and helpers
│   │   ├── helpers.ts   # Helper functions
│   │   └── helpers.test.ts # Bun tests for helpers
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind imports
├── .eslintrc.js         # ESLint configuration
├── .gitignore           # Git ignore rules
├── bunfig.toml          # Bun configuration
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
# Add regular dependencies
bun add package-name

# Add development dependencies
bun add -d package-name
```

## License

[MIT](LICENSE)

## Acknowledgements

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Bun](https://bun.sh/)
# Steno Contribution Guidelines

We welcome contributions to Steno! Whether it's reporting a bug, suggesting a
new feature, or submitting code, your help is valuable.

## How to Contribute

### 1. Reporting Bugs

If you find a bug, please report it on our
[GitHub Issues page](https://github.com/stenopress/steno/issues). When reporting
a bug, please include:

- A clear and concise description of the bug.
- Steps to reproduce the behavior.
- Expected behavior.
- Actual behavior.
- Screenshots or code snippets if applicable.
- Your Deno version and operating system.

### 2. Suggesting Enhancements

Have an idea for a new feature or an improvement to an existing one? We'd love
to hear it! Please open an issue on our
[GitHub Issues page](https://github.com/stenopress/steno/issues) and describe
your suggestion in detail.

### 3. Contributing Code

We appreciate code contributions! To contribute code, please follow these steps:

1. **Fork the Repository**: Start by forking the `steno` repository to your
   GitHub account.
2. **Clone Your Fork**: Clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/your-username/steno.git
   cd steno
   ```
3. **Create a New Branch**: Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number
   ```
4. **Make Your Changes**: Implement your changes, adhering to the project's
   coding style.
5. **Write Tests**: All new features and bug fixes should be accompanied by
   appropriate tests.
   - Run existing tests: `deno test -A`
   - Add new tests in the `src/*_test.ts` files or create new ones if necessary.
6. **Run Deno Fmt & Lint**: Ensure your code is formatted correctly and passes
   lint checks:
   ```bash
   deno fmt
   deno lint
   ```
7. **Commit Your Changes**: Write clear and concise commit messages.
   ```bash
   git commit -m "feat: Add new feature X"
   # or
   git commit -m "fix: Resolve issue #123"
   ```
8. **Push to Your Fork**: Push your changes to your fork on GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
9. **Open a Pull Request**: Go to the original `steno` repository on GitHub and
   open a new Pull Request from your forked branch.
   - Provide a clear title and description for your PR.
   - Reference any related issues (e.g., `Closes #123`).

## Code Style

- Follow the
  [Deno Style Guide](https://docs.deno.com/runtime/contributing/style_guide/).
- Use `deno fmt` to automatically format your code.
- Use `deno lint` to catch potential issues.

## Testing

- All new features should have corresponding unit or integration tests.
- Ensure all tests pass before submitting a Pull Request (`deno test -A`).

Thank you for contributing to Steno!

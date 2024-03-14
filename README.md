# Vercel for VS Code

## THIS IS A FORK FROM [haydenbleasel](https://github.com/haydenbleasel/vercel-vscode)

### Following changes were made:

- Project configuration is only available via .vercel/project.json file (run `vercel link` to create it)
- The latest build for your current branch is fetched instead of the latest build for the project
- On click the vercel deployment is opened in the browser

### Setup the extension:

- Install the extension
- Run `vercel link` in your terminal
- Insert your vercel access token in the extension settings
- Reload VSCode

# Original Readme:

A VS Code extension for Vercel deployment status.

![Screenshot](./screenshot.png)

## Usage

1. Install the extension from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=haydenbleasel.vercel-vscode) or with the terminal command `code --install-extension haydenbleasel.vercel-vscode`.
2. Open the extension settings and enter your API token (recommended to put this in your user settings so it is not shared with others).
3. In your terminal, run `vercel link`. This will create a file at `.vercel/project.json` with your project ID (`projectId`) and team ID (called `orgId`). You can also add these manually to your VSCode settings.
4. Reload VSCode to apply the changes and start using the extension.

## Development

0. Ensure you have the latest version of [Node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/) installed.
1. Clone the repo.
2. Run `yarn install` to install dependencies.
3. Run `yarn dev` to compile the extension and watch for changes.
4. Open the folder in VS Code.
5. Launch a new VSCode window with the extension loaded. You can either press `F5` or open the command palette and run `Debug: Start Debugging`.
6. Make changes to the extension and reload the extension to see them take effect.

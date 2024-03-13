import { workspace } from 'vscode';

const app = workspace.getConfiguration('vercelVSCode');

export const getAccessToken = (): string | undefined => app.get('accessToken');

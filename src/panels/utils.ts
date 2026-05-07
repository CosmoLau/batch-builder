import { readFileSync } from "fs";

import path from 'node:path';

export function getPackageJson() {
    return JSON.parse(readFileSync(path.join(Editor.Project.path, 'package.json'), 'utf-8'));
}
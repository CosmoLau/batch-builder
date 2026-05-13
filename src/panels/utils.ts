import path from 'node:path';

/**
 * 获取 Cocos 项目路径
 * @param relativePath 基于项目根路径的相对路径，默认为根路径
 * @returns 
 */
export function getProjectPath(relativePath = "") {
    return path.join(Editor.Project.path, relativePath);
}

/**
 * 绝对路径转换为 Cocos 项目的 url
 * @param absolutePath 绝对路径
 * @returns Cocos 项目的 url，例如：`db://assets/`
 */
export function absoluteToUrl(absolutePath: string) {
    let relativePath = path.relative(getProjectPath(), absolutePath);
    if (relativePath == '' || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        console.error(`${absolutePath} 不在项目路径 ${getProjectPath()} 下，请检查路径`);
        return;
    }
    let url = "db://" + relativePath.split(path.sep).join("/");
    return url;
}
import path from 'node:path';

/**
 * 获取 Cocos 项目路径
 * @param relativePath 基于项目根路径的相对路径，默认为根路径
 * @returns 
 */
export function getProjectPath(relativePath = "") {
    return path.join(Editor.Project.path, relativePath);
}
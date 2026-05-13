import packageInfo from "../../../package.json";

/** 仓库 */
const repo = `${packageInfo.author}/${packageInfo.name}`
/** API 地址 */
const api = `https://api.github.com/repos/${repo}/releases`

/** 获取远程仓库最新版本号 */
export const getLatestVersion = async (): Promise<string | null> => {
    try {
        const res = await fetch(api);
        const releases = await res.json();
        const latest = releases.find((r: any) => !r.prerelease);
        return latest?.tag_name || null;
    } catch {
        return null;
    }
};

/** 检查是否有版本更新 */
export const hasUpdate = async () => {
    const latest = await getLatestVersion();
    if (latest == null) return;
    const current = packageInfo.version;
    const toNum = (v: string) => v.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
    const c = toNum(current), l = toNum(latest);
    for (let i = 0; i < Math.max(c.length, l.length); i++) {
        if ((c[i] || 0) < (l[i] || 0)) return true;
        if ((c[i] || 0) > (l[i] || 0)) return false;
    }
    return false;
};

// import {path} from '@vuepress/utils'
import {SidebarItem} from "@vuepress/theme-default/lib/shared/nav";
import {resolve} from 'path';
import {readdirSync} from 'fs'

export function parseSidebarArrayJson(dirPath: string, titleGenerator: Function,
                                      sortBy: (a: string, b: string) => number = (a, b) => Number(a.match(/\d+/g)) - Number(b.match(/\d+/g)),
                                      autoSidebar: boolean = true): SidebarItem[] {
    // 获取文件夹的绝对路径
    const path = resolve(dirPath)
    const mdFileNames = readdirSync(path)
        .filter((filename: string) => filename !== 'README.md' && filename.endsWith(".md"))
        .sort(sortBy);
    let routePrefix = dirPath.substring(dirPath.indexOf("/"))
    if (routePrefix.endsWith("/")) {
        routePrefix = routePrefix.substring(0, routePrefix.length - 1)
    }
    let children = []
    for (let filename of mdFileNames) {
        if (filename === 'README.md' || !filename.endsWith(".md")) {
            continue;
        }
        const fileSimpleName = filename.replace(/\.md$/, "")
        const title = titleGenerator(fileSimpleName)
        children.push(
            {
                text: title,
                link: routePrefix + '/' + fileSimpleName,
                sidebarDepth: 4,
            }
        )
    }
    return children
}

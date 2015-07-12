export function stringToHtmlId(str: string): string {
    return str.replace(/\s/g, "-").toLowerCase();
}

export function urlToId(url: string): string {
    return url.replace(/[\{\}]/g, "-").toLowerCase();
}
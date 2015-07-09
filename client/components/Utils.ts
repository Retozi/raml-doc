export function stringToHtmlId(str: string): string {
    return str.replace(/\s/g, "-").toLowerCase();
}

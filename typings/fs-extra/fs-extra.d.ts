declare module "fs-extra" {
    function copySync(src: string, dest: string, cb?: (err: Error) => void): void
}
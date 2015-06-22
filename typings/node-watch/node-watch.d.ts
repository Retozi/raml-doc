declare module 'node-watch' {
    export = watch;

    function watch(path: string, cb: (path: string) => void): void;

}
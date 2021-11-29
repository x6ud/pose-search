export const file = {
    async read(path: string): Promise<ArrayBuffer> {
        const res = await fetch(path, {method: 'GET'});
        return res.arrayBuffer();
    },
    async write(path: string, content: Blob) {
        const formData = new FormData();
        formData.append('file', content);
        await fetch('file/' + path, {
            method: 'POST',
            body: formData,
        });
    },
    async readJson(path: string) {
        const buffer = await this.read(path);
        const str = await new Blob([buffer]).text();
        return await (JSON.parse(str));
    },
    async writeJson(path: string, content: any) {
        const str = JSON.stringify(content);
        const blob = new Blob([str]);
        await this.write(path, blob);
    },
};
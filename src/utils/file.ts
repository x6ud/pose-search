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
    }
};
import {file} from './file';
import Photo from './Photo';

export default class PhotoDataset {

    data: Photo[] = [];

    async load() {
        const buffer = await file.read('data.json');
        const str = await new Blob([buffer]).text();
        this.data = await (JSON.parse(str));
    }

    async writeToFile() {
        const str = JSON.stringify(this.data);
        const blob = new Blob([str]);
        await file.write('data.json', blob);
    }

    findById(id: string): Photo | null {
        return this.data.find(item => item.id === id) || null;
    }

    add(photo: Photo) {
        this.data.push(photo);
    }

}
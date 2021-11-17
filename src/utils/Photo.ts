export const enum PhotoGender {
    UNMARKED, MALE, FEMALE
}

export function getPhotoGenderByTags(tags: string[]): PhotoGender {
    let male = false;
    let female = false;
    if (
        tags.includes('male')
        || tags.includes('man')
        || tags.includes('men')
        || tags.includes('boy')
        || tags.includes('boys')
    ) {
        male = true;
    }
    if (
        tags.includes('female')
        || tags.includes('woman')
        || tags.includes('women')
        || tags.includes('girl')
        || tags.includes('girls')
    ) {
        female = true;
    }
    if (male && !female) {
        return PhotoGender.MALE;
    }
    if (!male && female) {
        return PhotoGender.FEMALE;
    }
    return PhotoGender.UNMARKED;
}

export default class Photo {
    id: string = '';
    width: number = 0;
    height: number = 0;

    full: string = '';
    regular: string = '';

    authorName: string = '';
    authorUsername: string = '';

    gender: PhotoGender = PhotoGender.UNMARKED;

    /** @see https://google.github.io/mediapipe/solutions/pose.html */
    normalizedLandmarks: { point: [number, number, number], visibility: number }[] = [];
    /** @see https://google.github.io/mediapipe/solutions/pose.html */
    worldLandmarks: { point: [number, number, number], visibility: number }[] = [];

    tags?: string[];
}
import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import Photo from '../../utils/Photo';

export type MatchResult = {
    score: number;
    /** Search result thumbs center */
    center: [number, number, number],
    /** Affect search result thumbs */
    related: [number, number, number][],
    flip: boolean;
};

export interface PoseMatcher {
    prepare(model: SkeletonModel): void;

    match(photo: Photo): MatchResult | null;
}

export type SearchResult = {
    score: number;
    center: [number, number, number],
    related: [number, number, number][],
    flip: boolean;
    photo: Photo;
};

export function filterAndSort(photos: Photo[], model: SkeletonModel, matcher: PoseMatcher): SearchResult[] {
    const ret: SearchResult[] = [];
    matcher.prepare(model);
    photos.forEach(photo => {
        const matchResult = matcher.match(photo);
        if (matchResult != null) {
            ret.push({
                ...matchResult,
                photo
            });
        }
    });
    ret.sort((a, b) => -a.score + b.score);
    return ret;
}
export type UnsplashPhotoBasic = {
    id: string;
    width: number;
    height: number;
    urls: {
        full: string;
        raw: string;
        regular: string;
        small: string;
        thumb: string;
    }
};

export type UnsplashSearchPhotosResult = {
    total: number;
    pages: number;
    photos: UnsplashPhotoBasic[];
};

type UnsplashSearchPhotosResponse = {
    total: number;
    total_pages: number;
    results: {
        id: string;
        width: number;
        height: number;
        urls: {
            full: string;
            raw: string;
            regular: string;
            small: string;
            thumb: string;
        }
    }[];
};

export async function unsplashSearchPhotos(accessKey: string, query: string, page: number, perPage: number): Promise<UnsplashSearchPhotosResult> {
    const params = new URLSearchParams({
        client_id: accessKey,
        query,
        page: page + '',
        per_page: perPage + '',
    });
    const response = await fetch('https://api.unsplash.com/search/photos/?' + params.toString());
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const json = await response.json() as UnsplashSearchPhotosResponse;
    return {
        total: json.total,
        pages: json.total_pages,
        photos: json.results
    };
}

type UnsplashGetPhotoResponse = {
    id: string;
    width: number;
    height: number;
    alt_description: string;
    description: string;
    tags: { type: string, title: string }[];
    links: {
        html: string;
    };
    urls: {
        full: string;
        raw: string;
        regular: string;
        small: string;
        thumb: string;
    };
    user: {
        name: string;
        username: string;
    };
};

export type UnsplashPhotoInfo = {
    id: string;
    width: number;
    height: number;
    tags: string[];
    link: string;
    urls: {
        full: string;
        raw: string;
        regular: string;
        small: string;
        thumb: string;
    };
    author: {
        name: string;
        username: string;
    };
};

export async function unsplashGetPhoto(accessKey: string, id: string): Promise<UnsplashPhotoInfo> {
    const params = new URLSearchParams({
        client_id: accessKey,
    });
    const response = await fetch('https://api.unsplash.com/photos/' + id + '?' + params.toString());
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const json = await response.json() as UnsplashGetPhotoResponse;
    return {
        id: json.id,
        width: json.width,
        height: json.height,
        tags: json.tags.map(tag => tag.title),
        link: json.links.html,
        urls: json.urls,
        author: {
            name: json.user.name,
            username: json.user.username,
        }
    };
}
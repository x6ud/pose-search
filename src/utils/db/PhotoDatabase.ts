import SqlJs, {Database, Statement} from 'sql.js';
import {NUM_OF_LANDMARKS} from '../detect-pose';
import {file} from '../file';
import Photo, {PhotoGender} from '../Photo';

import countRecordsSql from './sql/count-records.sql';
import createTablesSql from './sql/create-tables.sql';
import insertPhotoLandmarkSql from './sql/insert-photo-landmark.sql';
import insertPhotoSql from './sql/insert-photo.sql';
import selectPhotoByIdSql from './sql/select-photo-by-id.sql';
import selectPhotoLandmarkSql from './sql/select-photo-landmark.sql';
import selectPhotoPageSql from './sql/select-photo-page.sql';
import selectPhotoSql from './sql/select-photo.sql';
import updatePhotoGenderSql from './sql/update-photo-gender.sql';

const LANDMARK_TYPE_NORMALIZED = 0;
const LANDMARK_TYPE_WORLD = 1;

export default class PhotoDatabase {

    private database?: Database;

    async init(loadData: boolean = true) {
        const sql = await SqlJs({locateFile: file => `./assets/sql.js/${file}`});
        let buffer: ArrayBuffer | undefined;
        if (loadData) {
            buffer = await file.read('data.db');
        }
        this.database = new sql.Database(buffer && new Uint8Array(buffer));
    }

    async saveToFile(path = 'data.db') {
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        const buffer = this.database.export();
        const blob = new Blob([buffer.buffer]);
        await file.write(path, blob);
    }

    createTables() {
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        this.database.run(createTablesSql);
    }

    countRecords() {
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        return this.database.exec(countRecordsSql)[0].values[0][0] as number;
    }

    addPhoto(photo: Photo) {
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        const db = this.database;
        const insertPhoto = db.prepare(insertPhotoSql);
        const insertPhotoLandmark = db.prepare(insertPhotoLandmarkSql);

        try {
            insertPhoto.run([
                photo.id,
                photo.width,
                photo.height,
                photo.authorName,
                photo.authorUsername,
                photo.regular,
                photo.full,
                photo.gender,
            ]);

            for (let i = 0, len = photo.normalizedLandmarks.length; i < len; ++i) {
                const landmark = photo.normalizedLandmarks[i];
                insertPhotoLandmark.run([
                    photo.id,
                    i,
                    LANDMARK_TYPE_NORMALIZED,
                    landmark.point[0],
                    landmark.point[1],
                    landmark.point[2],
                    landmark.visibility,
                ]);
            }

            for (let i = 0, len = photo.worldLandmarks.length; i < len; ++i) {
                const landmark = photo.worldLandmarks[i];
                insertPhotoLandmark.run([
                    photo.id,
                    i,
                    LANDMARK_TYPE_WORLD,
                    landmark.point[0],
                    landmark.point[1],
                    landmark.point[2],
                    landmark.visibility,
                ]);
            }
        } finally {
            insertPhoto.free();
            insertPhotoLandmark.free();
        }
    }

    queryPhotoById(id: string): Photo | null {
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        const db = this.database;
        const selectPhotoById = db.prepare(selectPhotoByIdSql);
        const selectPhotoLandmark = db.prepare(selectPhotoLandmarkSql);
        try {
            const photo = selectPhotoById.getAsObject({$id: id}) as {
                id: string,
                width: number,
                height: number,
                authorName: string,
                authorUsername: string,
                regular: string,
                full: string,
                gender: number,
            };
            if (photo?.id == null) {
                return null;
            }
            return this.createPhoto(photo, selectPhotoLandmark);
        } finally {
            selectPhotoById.free();
            selectPhotoLandmark.free();
        }
    }

    queryAllPhotos(): Photo[] {
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        const db = this.database;
        const selectPhoto = db.prepare(selectPhotoSql);
        const selectPhotoLandmark = db.prepare(selectPhotoLandmarkSql);

        try {
            selectPhoto.bind({});
            const ret: Photo[] = [];
            while (selectPhoto.step()) {
                const photo = selectPhoto.getAsObject() as {
                    id: string,
                    width: number,
                    height: number,
                    authorName: string,
                    authorUsername: string,
                    regular: string,
                    full: string,
                    gender: number,
                };
                ret.push(this.createPhoto(photo, selectPhotoLandmark));
            }
            return ret;
        } finally {
            selectPhoto.free();
            selectPhotoLandmark.free();
        }
    }

    queryPhotosPage(pageSize: number, page: number) {
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        const db = this.database;
        const selectPhotoPage = db.prepare(selectPhotoPageSql);
        const selectPhotoLandmark = db.prepare(selectPhotoLandmarkSql);
        try {
            selectPhotoPage.bind({
                $limit: pageSize,
                $offset: (page - 1) * pageSize,
            });
            const ret: Photo[] = [];
            while (selectPhotoPage.step()) {
                const photo = selectPhotoPage.getAsObject() as {
                    id: string,
                    width: number,
                    height: number,
                    authorName: string,
                    authorUsername: string,
                    regular: string,
                    full: string,
                    gender: number,
                };
                ret.push(this.createPhoto(photo, selectPhotoLandmark));
            }
            return ret;
        } finally {
            selectPhotoPage.free();
            selectPhotoLandmark.free();
        }
    }

    private createPhoto(
        base: {
            id: string,
            width: number,
            height: number,
            authorName: string,
            authorUsername: string,
            regular: string,
            full: string,
            gender: number
        },
        selectPhotoLandmarkStmt?: Statement
    ) {
        const ret = new Photo();
        ret.id = base.id;
        ret.width = base.width;
        ret.height = base.height;
        ret.authorName = base.authorName;
        ret.authorUsername = base.authorUsername;
        ret.regular = base.regular;
        ret.full = base.full;
        ret.gender = base.gender;

        if (selectPhotoLandmarkStmt) {
            const normalizedLandmarks: { x: number, y: number, z: number, visibility: number }[] = [];
            selectPhotoLandmarkStmt.bind({$photoId: base.id, $type: LANDMARK_TYPE_NORMALIZED});
            while (selectPhotoLandmarkStmt.step()) {
                const row = selectPhotoLandmarkStmt.getAsObject() as { x: number, y: number, z: number, visibility: number };
                normalizedLandmarks.push({...row});
            }
            if (normalizedLandmarks.length === NUM_OF_LANDMARKS) {
                ret.normalizedLandmarks = normalizedLandmarks.map(item => ({
                    point: [item.x, item.y, item.z],
                    visibility: item.visibility
                }));
            }

            const worldLandmarks: { x: number, y: number, z: number, visibility: number }[] = [];
            selectPhotoLandmarkStmt.bind({$photoId: base.id, $type: LANDMARK_TYPE_WORLD});
            while (selectPhotoLandmarkStmt.step()) {
                const row = selectPhotoLandmarkStmt.getAsObject() as { x: number, y: number, z: number, visibility: number };
                worldLandmarks.push({...row});
            }
            if (worldLandmarks.length === NUM_OF_LANDMARKS) {
                ret.worldLandmarks = worldLandmarks.map(item => ({
                    point: [item.x, item.y, item.z],
                    visibility: item.visibility
                }));
            }
        }

        return ret;
    }

    updatePhotoGender(id: string, gender: PhotoGender) {
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        const db = this.database;
        db.exec(updatePhotoGenderSql, {$id: id, $gender: gender});
    }

}
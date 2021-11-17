CREATE TABLE IF NOT EXISTS photo
(
    "id"             TEXT PRIMARY KEY,
    "width"          INTEGER,
    "height"         INTEGER,
    "authorName"     TEXT,
    "authorUsername" TEXT,
    "regular"        TEXT,
    "full"           TEXT,
    "gender"         INTEGER
);

CREATE TABLE IF NOT EXISTS photo_landmark
(
    "photoId"    TEXT,
    "index"      INTEGER,
    "type"       INTEGER,
    "x"          REAL,
    "y"          REAL,
    "z"          REAL,
    "visibility" REAL
);
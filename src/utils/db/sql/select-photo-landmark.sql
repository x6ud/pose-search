SELECT "x", "y", "z", "visibility"
FROM photo_landmark
WHERE "photoId" = $photoId
  AND "type" = $type
ORDER BY "index";
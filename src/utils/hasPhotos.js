// src/utils/hasPhotos.js
export const hasPhotos = (entity, entityType) => {
  let count = 0;

  const countPhotos = (photosObj) => {
    if (!photosObj) return;
    ['sketch', 'example', 'specific'].forEach(type => {
      count += (photosObj[type] || []).filter(photo => photo.url).length;
    });
  };

  if (entityType === 'district') {
    countPhotos(entity.photos);
    Object.values(entity.estates || {}).forEach(estate => {
      countPhotos(estate.photos);
      Object.values(estate.blocks || {}).forEach(block => {
        countPhotos(block.photos);
        Object.values(block.apartment_types || {}).forEach(type => {
          countPhotos(type.photos);
          (type.apartments || []).forEach(ap => countPhotos(ap.photos));
        });
      });
    });
  } else if (entityType === 'estate') {
    countPhotos(entity.photos);
    Object.values(entity.blocks || {}).forEach(block => {
      countPhotos(block.photos);
      Object.values(block.apartment_types || {}).forEach(type => {
        countPhotos(type.photos);
        (type.apartments || []).forEach(ap => countPhotos(ap.photos));
      });
    });
  } else if (entityType === 'apartment') {
    countPhotos(entity.photos);
    // Для родителей — предполагаем, что entity имеет photos из родителей, или считаем отдельно (но здесь упрощённо, т.к. в модалке полный счёт)
    // Если нужно точно, интегрируйте поиск как в модалке, но для hasPhotos достаточно приблизительно
  }

  return count > 0;
};
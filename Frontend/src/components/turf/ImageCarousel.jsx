import React from 'react';

const ImageCarousel = ({ images = [], turfName = 'Turf Pitch' }) => {
  const hasUploadedImages = Array.isArray(images) && images.length > 0;
  const imageList = hasUploadedImages ? images : [{ imageUrl: '/assets/default-turf.png' }];

  const formatImageUrl = (url) => {
    if (!url) return '/assets/default-turf.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div id="turfCarousel" className="carousel slide shadow-sm rounded-4 overflow-hidden" data-bs-ride="carousel">
      <div className="carousel-inner bg-light" style={{ maxHeight: '420px', minHeight: '300px' }}>
        {imageList.map((imgObj, idx) => {
          const rawUrl = imgObj.imageUrl || imgObj;
          const isDefault = !rawUrl || rawUrl.includes('default-turf.png') || !hasUploadedImages;
          return (
            <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''}`} style={{ height: '420px', backgroundColor: isDefault ? '#fdfbf7' : '#f8f9fa' }}>
              <img
                src={formatImageUrl(rawUrl)}
                className="d-block w-100 h-100"
                alt={`${turfName} photo ${idx + 1}`}
                style={{
                  objectFit: isDefault ? 'contain' : 'cover',
                  padding: isDefault ? '12px' : '0px',
                  backgroundColor: isDefault ? '#fdfbf7' : 'transparent',
                }}
                onError={(e) => {
                  e.target.src = '/assets/default-turf.png';
                  e.target.style.objectFit = 'contain';
                  e.target.style.padding = '12px';
                  e.target.style.backgroundColor = '#fdfbf7';
                }}
              />
            </div>
          );
        })}
      </div>

      {imageList.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" data-bs-target="#turfCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon bg-dark bg-opacity-50 rounded-circle p-3" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#turfCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon bg-dark bg-opacity-50 rounded-circle p-3" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </>
      )}

      <div className="position-absolute bottom-0 end-0 m-3 badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill">
        <i className="bi bi-camera me-1"></i> {imageList.length} {imageList.length === 1 ? 'Photo' : 'Photos'}
      </div>
    </div>
  );
};

export default ImageCarousel;

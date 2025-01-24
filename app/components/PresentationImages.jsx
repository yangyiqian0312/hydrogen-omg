const images = [
  '/public/presentation/1.png',
  '/public/presentation/2.png',
  '/public/presentation/3.png',
  '/public/presentation/4.png',
  '/public/presentation/5.png',
  '/public/presentation/6.png',
];
  
  const PresentationImages = () => {
    return (
      <div className="relative aspect-square">
        {images.length > 0 ? (
          <img
            src={images[0]} // 默认显示第一张图片
            alt="Presentation"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/api/placeholder/400/400" // 占位图片
            alt="Placeholder"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  };
  
  export default PresentationImages;
  
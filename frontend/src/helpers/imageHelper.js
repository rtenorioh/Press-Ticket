export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    if (imagePath.startsWith('/assets/')) {
        imagePath = imagePath.replace('/assets/', '');
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    const finalPath = cleanPath.startsWith('logos/') ? cleanPath : `logos/${cleanPath}`;

    const backendUrl = process.env.REACT_APP_BACKEND_URL || window.location.origin;
    console.log('URL final da imagem:', `${backendUrl}/public/${finalPath}`);
    
    return `${backendUrl}/public/${finalPath}`;
};

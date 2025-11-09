import { Screenshot } from '../types';

export const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Failed to convert image to base64:', error);
        return imageUrl; // Fallback to original URL
    }
};

export const convertAllScreenshotsToBase64 = async (screenshots: Screenshot[]): Promise<Screenshot[]> => {
    const convertedScreenshots = await Promise.all(
        screenshots.map(async (shot) => ({
            ...shot,
            url: await convertImageToBase64(shot.url)
        }))
    );
    return convertedScreenshots;
};

export const createImageMarkdown = (screenshots: Screenshot[]): string => {
    return screenshots.map(shot => {
        // Check if it's already a base64 image
        if (shot.url.startsWith('data:image/')) {
            return `![${shot.label}](${shot.url})`;
        }
        return `![${shot.label}](${shot.url})`;
    }).join('\n\n');
};
'use client'

import React, { useState } from 'react';
import { Upload, Scissors, Download, Maximize2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ImageCropApp() {
    const [images, setImages] = useState([]);
    const [processedImages, setProcessedImages] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const processImage = async (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    tempCtx.drawImage(img, 0, 0);

                    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                    const data = imageData.data;

                    // Function to get the percentage of white pixels in a line
                    const getLineWhiteness = (position, isHorizontal) => {
                        let whiteCount = 0;
                        const sampleSize = isHorizontal ? 10 : 5; // Sample every 10px horizontally, 5px vertically
                        const length = isHorizontal ? img.width : img.height;

                        for (let i = 0; i < length; i += sampleSize) {
                            const x = isHorizontal ? i : position;
                            const y = isHorizontal ? position : i;
                            const idx = (y * img.width + x) * 4;
                            const grayscale = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                            if (grayscale > 200) { // High threshold for white
                                whiteCount += sampleSize;
                            }
                        }
                        return (whiteCount / length) * 100;
                    };

                    // Find boundaries using whiteness detection
                    let top = 0;
                    let bottom = img.height - 1;
                    let left = 0;
                    let right = img.width - 1;

                    // Find left edge
                    for (let x = 0; x < img.width * 0.4; x++) {
                        if (getLineWhiteness(x, false) > 30) {
                            left = Math.max(0, x - 10);
                            break;
                        }
                    }

                    // Find right edge
                    for (let x = img.width - 1; x >= img.width * 0.6; x--) {
                        if (getLineWhiteness(x, false) > 30) {
                            right = Math.min(img.width - 1, x + 10);
                            break;
                        }
                    }

                    // Find top edge
                    for (let y = 0; y < img.height * 0.4; y++) {
                        if (getLineWhiteness(y, true) > 30) {
                            top = Math.max(0, y - 10);
                            break;
                        }
                    }

                    // Find bottom edge
                    for (let y = img.height - 1; y >= img.height * 0.6; y--) {
                        if (getLineWhiteness(y, true) > 30) {
                            bottom = Math.min(img.height - 1, y + 10);
                            break;
                        }
                    }

                    // Fallback for minimum content size
                    const minContentWidth = img.width * 0.5;
                    const minContentHeight = img.height * 0.3;

                    const contentWidth = right - left;
                    const contentHeight = bottom - top;

                    if (contentWidth < minContentWidth || contentHeight < minContentHeight) {
                        left = Math.floor(img.width * 0.05);
                        right = Math.ceil(img.width * 0.95);
                        top = Math.floor(img.height * 0.1);
                        bottom = Math.ceil(img.height * 0.9);
                    }

                    // Calculate final dimensions
                    const width = right - left;
                    const height = bottom - top;

                    // Set target width and maintain aspect ratio
                    const targetWidth = 1200;
                    const targetHeight = Math.round((height * targetWidth) / width);

                    // Create output canvas
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    // Fill with white background
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw the cropped content
                    ctx.drawImage(
                        img,
                        left, top, width, height,
                        0, 0, targetWidth, targetHeight
                    );

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('Failed to create image blob'));
                            return;
                        }
                        resolve(URL.createObjectURL(blob));
                    }, 'image/jpeg', 0.95);
                } catch (err) {
                    reject(err);
                }
            };

            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setImages(files);
        setError(null);
        setProcessing(true);

        try {
            console.log('Processing', files.length, 'images');
            const processed = await Promise.all(
                files.map(async (file) => {
                    try {
                        return await processImage(file);
                    } catch (err) {
                        console.error('Error processing file:', file.name, err);
                        throw new Error(`Failed to process ${file.name}: ${err.message}`);
                    }
                })
            );
            setProcessedImages(processed);
            console.log('Successfully processed all images');
        } catch (err) {
            console.error('Processing error:', err);
            setError(`Error processing images: ${err.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const downloadImages = () => {
        // Create a delay between downloads to prevent browser blocking
        const downloadWithDelay = (index) => {
            if (index >= processedImages.length) return;

            setTimeout(() => {
                try {
                    const url = processedImages[index];
                    fetch(url)
                        .then(response => response.blob())
                        .then(blob => {
                            const blobUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = blobUrl;
                            a.download = `processed_image_${index + 1}.jpg`;

                            document.body.appendChild(a);
                            a.click();

                            // Cleanup
                            window.URL.revokeObjectURL(blobUrl);
                            document.body.removeChild(a);

                            // Download next image
                            downloadWithDelay(index + 1);
                        });
                } catch (error) {
                    console.error(`Error downloading image ${index + 1}:`, error);
                    // Continue with next image even if one fails
                    downloadWithDelay(index + 1);
                }
            }, 100); // 100ms delay between downloads
        };

        // Start downloading from first image
        downloadWithDelay(0);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Book Page Cropper</h1>
                <p className="text-gray-600">Upload scanned book pages to automatically remove borders and standardize size</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition"
                >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Images
                </label>

                {processing && (
                    <div className="flex items-center justify-center space-x-2">
                        <Scissors className="w-5 h-5 animate-spin" />
                        <span>Processing images...</span>
                    </div>
                )}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {processedImages.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Processed Images ({processedImages.length})</h2>
                        <button
                            onClick={downloadImages}
                            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Download All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {processedImages.map((url, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={url}
                                    alt={`Processed ${index + 1}`}
                                    className="w-full rounded-lg shadow-md"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black bg-opacity-50 rounded-lg">
                                    <a
                                        href={url}
                                        download={`processed_image_${index + 1}.jpg`}
                                        className="p-2 bg-white rounded-full"
                                    >
                                        <Maximize2 className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
# Book Page Image Processor

A web application built with Next.js that automatically processes scanned book pages by removing black borders, 
standardizing dimensions, and maintaining clean white margins. 

### This tool was developed by Claude, an AI assistant created by Anthropic.

## Features

- Removes black borders from scanned book pages
- Standardizes all images to 1200px width while maintaining aspect ratio
- Adds consistent white padding around content
- Supports batch processing of multiple images
- Provides real-time preview of processed images
- Allows downloading individual or all processed images
- Responsive design that works on both desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository or create a new Next.js project:
```bash
npx create-next-app@latest book-page-processor
cd book-page-processor
```

2. Install required dependencies:
```bash
npm install lucide-react @radix-ui/react-alert-dialog @radix-ui/react-slot class-variance-authority clsx tailwindcss-animate
```

3. Create the necessary component files:

- Create `components/ImageCropApp.jsx` and paste the main component code
- Create `components/ui/alert.jsx` for the alert component
- Create `lib/utils.js` for utility functions

### Running the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application running.

## Usage

1. Click the "Upload Images" button to select one or more scanned book pages
2. The app will automatically process each image to:
    - Remove black borders
    - Standardize dimensions
    - Add white padding
3. Preview the processed images in the grid below
4. Download individual images by hovering over them and clicking the maximize icon
5. Use the "Download All" button to download all processed images

## Technical Details

- Built with Next.js 14 and React 18
- Uses HTML Canvas API for image processing
- Implements efficient border detection algorithms
- Processes images entirely in the browser
- Uses Tailwind CSS for styling
- Includes error handling and loading states

## Development Notes

- The image processing algorithm uses whiteness detection to find content boundaries
- Different sampling rates are used for horizontal (10px) and vertical (5px) scanning
- Content detection threshold is set to 30% whiteness
- Maintains minimum content area requirements to prevent over-cropping
- Implements sequential downloading with delays to handle multiple files

## Author

This application was entirely created by Claude, an AI assistant by Anthropic, 
it was only implemented and hosted by: Dushan Cimbaljevic dushan@digitalnode.com

## License

MIT License - feel free to use and modify the code as needed.

## Acknowledgments

- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- Radix UI for accessible component primitives
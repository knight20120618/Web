import express, { Express, Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import jimp from 'jimp';

const app: Express = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/favicon.ico', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req: Request, res: Response) => {
    const data = { title: 'DITHERING' };
    res.render('index', data);
});

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'public/uploads/');
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const encodedBuffer = Buffer.from(file.originalname, 'binary');
        const decodedName = encodedBuffer.toString('utf-8');
        cb(null, decodedName);
    }
});

const upload = multer({ storage: storage });

interface UploadedFile {
    originalname: string;
    url: string;
}

let FILES: UploadedFile[] = [];

app.use(express.json());

app.post('/upload', upload.array('file'), (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    const uploadedFiles: UploadedFile[] = [];

    files.forEach((file) => {
        const oldPath = file.path;
        const encodedBuffer = Buffer.from(file.originalname, 'binary');
        const decodedName = encodedBuffer.toString('utf-8');
        const newPath = path.join(__dirname, `public/uploads/${decodedName}`);
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error(err);
            }
        });

        const publicURL = `/uploads/${decodedName}`;
        uploadedFiles.push({
            originalname: decodedName,
            url: publicURL,
        });
    });

    FILES = uploadedFiles;

    res.json({ files: uploadedFiles });
});

app.post('/cut', (req: Request, res: Response) => {
    const filename = req.body.filename as string;

    const imagePath = path.join(__dirname, 'public', 'uploads', filename);
    fs.unlink(imagePath, (err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'not delete' });
        } else {
            res.json({ success: true, message: 'delete ok' });
        }
    });
});

app.post('/api', async (req: Request, res: Response) => {
    const resolutions = req.body as { resolution: string; imageURL: string; filename: string }[];

    try {
        const processedImages: { filename: string; processedImageURL: string }[] = [];

        for (const resolutionData of resolutions) {
            const resolution = resolutionData.resolution;
            const [width, height] = resolution.split('*');
            const imageURL = resolutionData.imageURL;
            let filename = resolutionData.filename;

            const image = await jimp.read(decodeURIComponent(imageURL));

            image.resize(parseInt(width, 10), parseInt(height, 10));

            filename = path.basename(decodeURIComponent(filename), path.extname(decodeURIComponent(filename))) + '.bmp';

            const processedURL = path.join(__dirname, 'public', 'downloads', decodeURIComponent(filename));
            await image.writeAsync(processedURL);

            processedImages.push({
                filename: filename,
                processedImageURL: `/downloads/${decodeURIComponent(filename)}`
            });
        }

        res.json(processedImages);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/dithering', (req: Request, res: Response) => {
    fs.readdir(path.join(__dirname, 'public/downloads'), (err, FILES) => {
        const previewFiles: UploadedFile[] = [];
        const colorPalette = req.body.dither as { r: number; g: number; b: number }[];

        function findClosestColor(targetColor: { r: number; g: number; b: number }, colorPalette: { r: number; g: number; b: number }[]) {
            return colorPalette.reduce((closest, color) => {
                const colorDistance = Math.sqrt(
                    Math.pow(targetColor.r - color.r, 2) +
                    Math.pow(targetColor.g - color.g, 2) +
                    Math.pow(targetColor.b - color.b, 2)
                );

                if (colorDistance < closest.distance) {
                    return { color, distance: colorDistance };
                }

                return closest;
            }, { color: colorPalette[0], distance: Infinity }).color;
        }

        Promise.all(
            FILES.map((file) => {
                return new Promise<void>((resolve, reject) => {
                    const inputFilePath = path.join(__dirname, 'public/downloads', file);
                    const outputFilePath = path.join(__dirname, 'public/downloads', file);

                    jimp.read(inputFilePath)
                        .then((image) => {
                            image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                                const pixel = {
                                    r: image.bitmap.data[idx],
                                    g: image.bitmap.data[idx + 1],
                                    b: image.bitmap.data[idx + 2]
                                };

                                const closestColor = findClosestColor(pixel, colorPalette);

                                const error = {
                                    r: pixel.r - closestColor.r,
                                    g: pixel.g - closestColor.g,
                                    b: pixel.b - closestColor.b
                                };

                                image.bitmap.data[idx] = closestColor.r;
                                image.bitmap.data[idx + 1] = closestColor.g;
                                image.bitmap.data[idx + 2] = closestColor.b;

                                if (x < image.bitmap.width - 1) {
                                    const nextIdx = idx + 4;
                                    image.bitmap.data[nextIdx] = Math.max(0, Math.min(255, image.bitmap.data[nextIdx] + error.r * 7 / 16));
                                    image.bitmap.data[nextIdx + 1] = Math.max(0, Math.min(255, image.bitmap.data[nextIdx + 1] + error.g * 7 / 16));
                                    image.bitmap.data[nextIdx + 2] = Math.max(0, Math.min(255, image.bitmap.data[nextIdx + 2] + error.b * 7 / 16));
                                }

                                if (x > 0 && y < image.bitmap.height - 1) {
                                    const nextRowIdx = idx + (image.bitmap.width * 4);
                                    image.bitmap.data[nextRowIdx - 4] = Math.max(0, Math.min(255, image.bitmap.data[nextRowIdx - 4] + error.r * 3 / 16));
                                    image.bitmap.data[nextRowIdx - 3] = Math.max(0, Math.min(255, image.bitmap.data[nextRowIdx - 3] + error.g * 3 / 16));
                                    image.bitmap.data[nextRowIdx - 2] = Math.max(0, Math.min(255, image.bitmap.data[nextRowIdx - 2] + error.b * 3 / 16));
                                }

                                if (x < image.bitmap.width - 1 && y < image.bitmap.height - 1) {
                                    const nextDiagonalIdx = idx + (image.bitmap.width * 4) + 4;
                                    image.bitmap.data[nextDiagonalIdx - 4] = Math.max(0, Math.min(255, image.bitmap.data[nextDiagonalIdx - 4] + error.r * 1 / 16));
                                    image.bitmap.data[nextDiagonalIdx - 3] = Math.max(0, Math.min(255, image.bitmap.data[nextDiagonalIdx - 3] + error.g * 1 / 16));
                                    image.bitmap.data[nextDiagonalIdx - 2] = Math.max(0, Math.min(255, image.bitmap.data[nextDiagonalIdx - 2] + error.b * 1 / 16));
                                }
                            });

                            const previewFile: UploadedFile = {
                                originalname: file,
                                url: `/downloads/${file}`
                            };

                            image.write(outputFilePath, async (err) => {
                                if (err) {
                                    console.error('fail dither', err);
                                    reject(err);
                                } else {
                                    previewFiles.push(previewFile);
                                    resolve();
                                }
                            });
                        })
                        .catch((err) => {
                            console.error('fail read', err);
                            reject(err);
                        });
                });
            })
        )
            .then(() => {
                res.json({ files: previewFiles });
            })
            .catch((err) => {
                res.status(500).json({ error: '404' });
            });
    });
});

app.delete('/delete', (req: Request, res: Response) => {
    const folderPaths = [
        path.join(__dirname, 'public', 'downloads'),
        path.join(__dirname, 'public', 'uploads'),
    ];

    try {
        folderPaths.forEach(folderPath => {
            if (fs.existsSync(folderPath)) {
                const files = fs.readdirSync(folderPath);

                files.forEach(file => {
                    const filePath = path.join(folderPath, file);
                    fs.unlinkSync(filePath);
                });
            } else {
                res.status(404).json({ message: '404' });
                return;
            }
        });

        res.status(200).json({ message: 'delete ok' });
    } catch (err) {
        res.status(500).json({ message: 'not delete' });
    }
});

app.listen(3000, () => {
    console.log(`http://127.0.0.1:3000`);
});
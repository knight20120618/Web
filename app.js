var express = require('express');
var app = express();

var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => { // ICON logo
    res.sendFile(__dirname, 'public', 'favicon.ico')
});

app.set('view engine', 'ejs'); // template
app.set('views', path.join(__dirname, 'views'));
app.get('/', (req, res) => { // main page
    var data = { title: 'DITHERING' };
    res.render('index', data);
});

var fs = require('fs');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => { // upload save files
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => { // encoding filename
        var encodedBuffer = Buffer.from(file.originalname, 'binary');
        var decodedName = encodedBuffer.toString('utf-8');
        cb(null, decodedName);
    }
});
var upload = multer({ storage: storage });
var FILES = []; // save images informations
app.use(express.json()); // JSON
app.post('/upload', upload.array('file'), (req, res) => {
    var files = req.files;

    var uploadedFiles = []; // null array

    files.forEach((file) => {
        var oldPath = file.path; // read file imformations
        var encodedBuffer = Buffer.from(file.originalname, 'binary'); // encoding filename
        var decodedName = encodedBuffer.toString('utf-8');
        var newPath = path.join(__dirname, `public/uploads/${decodedName}`);
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error(err);
            }
        });

        var publicURL = `/uploads/${decodedName}`;
        FILES = uploadedFiles.push({
            originalname: decodedName, // filename
            url: publicURL, // URL
        });
    });

    res.json({ files: uploadedFiles });
});

app.post('/cut', (req, res) => { // delete local images
    var filename = req.body.filename;

    var imagePath = path.join(__dirname, 'public', 'uploads', filename);
    fs.unlink(imagePath, (err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'not delete' });
        } else {
            res.json({ success: true, message: 'delete ok' });
        }
    });
});

var jimp = require('jimp'); // image processing
app.post('/api', async (req, res) => {
    var resolutions = req.body;

    try {
        var processedImages = []; // save images

        for (var resolutionData of resolutions) {
            var resolution = resolutionData.resolution;
            var [width, height] = resolution.split('*'); // W*H
            var imageURL = resolutionData.imageURL; // URL
            var filename = resolutionData.filename; //filename

            var image = await jimp.read(decodeURIComponent(imageURL));

            image.resize(parseInt(width, 10), parseInt(height, 10));

            filename = path.basename(decodeURIComponent(filename), path.extname(decodeURIComponent(filename))) + '.bmp';

            var processedURL = path.join(__dirname, 'public', 'downloads', decodeURIComponent(filename));
            await image.writeAsync(processedURL);

            processedImages.push({
                filename: filename, // filename
                processedImageURL: `/downloads/${decodeURIComponent(filename)}` // URL
            });
        }

        res.json(processedImages);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/dithering', (req, res) => {
    fs.readdir(path.join(__dirname, 'public/downloads'), (err, FILES) => {
        var previewFiles = [];
        var colorPalette = req.body.dither;

        function findClosestColor(targetColor, colorPalette) { // find near colorPalette
            return colorPalette.reduce((closest, color) => {
                var colorDistance = Math.sqrt(
                    Math.pow(targetColor.r - color.r, 2) +
                    Math.pow(targetColor.g - color.g, 2) +
                    Math.pow(targetColor.b - color.b, 2)
                );

                if (colorDistance < closest.distance) {
                    return { color, distance: colorDistance };
                }

                return closest;
            }, { color: colorPalette[0], distance: Infinity }).color; // default value
        }

        Promise.all(
            FILES.map((file) => {
                return new Promise((resolve, reject) => {
                    var inputFilePath = path.join(__dirname, 'public/downloads', file);
                    var outputFilePath = path.join(__dirname, 'public/downloads', file);

                    jimp.read(inputFilePath)
                        .then((image) => {
                            image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                                var pixel = {
                                    r: image.bitmap.data[idx],
                                    g: image.bitmap.data[idx + 1],
                                    b: image.bitmap.data[idx + 2]
                                };

                                var closestColor = findClosestColor(pixel, colorPalette);

                                var error = {
                                    r: pixel.r - closestColor.r,
                                    g: pixel.g - closestColor.g,
                                    b: pixel.b - closestColor.b
                                };

                                image.bitmap.data[idx] = closestColor.r;
                                image.bitmap.data[idx + 1] = closestColor.g;
                                image.bitmap.data[idx + 2] = closestColor.b;

                                if (x < image.bitmap.width - 1) {
                                    var nextIdx = idx + 4; // next RGB
                                    image.bitmap.data[nextIdx] = Math.max(0, Math.min(255, image.bitmap.data[nextIdx] + error.r * 7 / 16));
                                    image.bitmap.data[nextIdx + 1] = Math.max(0, Math.min(255, image.bitmap.data[nextIdx + 1] + error.g * 7 / 16));
                                    image.bitmap.data[nextIdx + 2] = Math.max(0, Math.min(255, image.bitmap.data[nextIdx + 2] + error.b * 7 / 16));
                                }

                                if (x > 0 && y < image.bitmap.height - 1) {
                                    var nextRowIdx = idx + (image.bitmap.width * 4);
                                    image.bitmap.data[nextRowIdx - 4] = Math.max(0, Math.min(255, image.bitmap.data[nextRowIdx - 4] + error.r * 3 / 16));
                                    image.bitmap.data[nextRowIdx - 3] = Math.max(0, Math.min(255, image.bitmap.data[nextRowIdx - 3] + error.g * 3 / 16));
                                    image.bitmap.data[nextRowIdx - 2] = Math.max(0, Math.min(255, image.bitmap.data[nextRowIdx - 2] + error.b * 3 / 16));
                                }

                                if (x < image.bitmap.width - 1 && y < image.bitmap.height - 1) {
                                    var nextDiagonalIdx = idx + (image.bitmap.width * 4) + 4;
                                    image.bitmap.data[nextDiagonalIdx - 4] = Math.max(0, Math.min(255, image.bitmap.data[nextDiagonalIdx - 4] + error.r * 1 / 16));
                                    image.bitmap.data[nextDiagonalIdx - 3] = Math.max(0, Math.min(255, image.bitmap.data[nextDiagonalIdx - 3] + error.g * 1 / 16));
                                    image.bitmap.data[nextDiagonalIdx - 2] = Math.max(0, Math.min(255, image.bitmap.data[nextDiagonalIdx - 2] + error.b * 1 / 16));
                                }
                            });

                            var previewFile = {
                                originalname: file, // filename
                                url: `/downloads/${file}` // URL
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

app.delete('/delete', (req, res) => { // delete server files
    var folderPaths = [
        path.join(__dirname, 'public', 'downloads'),
        path.join(__dirname, 'public', 'uploads'),
    ];

    try {
        folderPaths.forEach(folderPath => {
            if (fs.existsSync(folderPath)) {
                var files = fs.readdirSync(folderPath);

                files.forEach(file => {
                    var filePath = path.join(folderPath, file);
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

app.listen(3000, () => { // localhost
    console.log(`http://127.0.0.1:3000`);
});

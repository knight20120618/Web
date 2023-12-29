var preventBeforeUnload: boolean = true; // initial value
window.addEventListener('beforeunload', function (event: BeforeUnloadEvent) {
    event.preventDefault(); // preventdefault

    if (preventBeforeUnload) {
        var CONFIRM: boolean = confirm('');
        event.returnValue = CONFIRM; // show alert
    }
});

var BTN: HTMLElement | null = document.getElementById('BTN'); // home button
var FILE: HTMLInputElement | null = document.getElementById('file'); // files pick
var LIST: HTMLElement | null = document.getElementById('list'); // show list
var STR: HTMLElement | null = document.getElementById('str'); // show list word
var UPLOAD: HTMLElement | null = document.getElementById('upload'); // upload button
var DIV: HTMLElement | null = document.getElementById('DIV');
var PHOTO: HTMLElement | null = document.getElementById('photo'); // show photo
var PICK: HTMLSelectElement | null = document.getElementById('width-height'); // resolution pick
var RESOLUTION: HTMLElement | null = document.getElementById('resolution'); // transform resolution
var btnRESOLUTION: HTMLElement | null = document.getElementById('RESOLUTION');
var SELECT: HTMLSelectElement | null = document.getElementById('select'); // show menu
var COLOR: HTMLElement | null = document.getElementById('color'); // dither button
var btnCOLOR: HTMLElement | null = document.getElementById('COLOR');
var DOWNLOAD: HTMLElement | null = document.getElementById('download'); // download button
var btnDOWNLOAD: HTMLElement | null = document.getElementById('DOWNLOAD');

var PHOTO0: string | null = PHOTO.style.display;  // photo site
var PHOTO1: string | null = PHOTO.style.position;
var SELECT0: string | null = SELECT.style.display; // menu site
var SELECT1: string | null = SELECT.style.position;
var btnCOLOR0: string | null = btnCOLOR.style.display; // dither button site
var btnCOLOR1: string | null = btnCOLOR.style.position;
var PICK0: string | null = PICK.style.display; // resolution site
var PICK1: string | null = PICK.style.position;
var btnRESOLUTION0: string | null = btnRESOLUTION.style.display; // transform resolution site
var btnRESOLUTION1: string | null = btnRESOLUTION.style.position;
var btnDOWNLOAD0: string | null = btnDOWNLOAD.style.display; // download button site
var btnDOWNLOAD1: string | null = btnDOWNLOAD.style.position;
var BTN0: string | null = BTN.style.display; // home button
var BTN1: string | null = BTN.style.position;

var loaderwrapper: HTMLElement | null = document.getElementById("loader-wrapper"); // animation
var loader: HTMLElement | null = document.getElementById("loader");
function showLoader(): void { // show animation
    if (loaderwrapper && loader) {
        loaderwrapper.style.display = 'flex';
        loader.style.display = "block";
    }
}
function hideLoader(): void { // notshow animation
    if (loaderwrapper && loader) {
        loaderwrapper.style.display = "none";
        loader.style.display = "none";
    }
}

window.addEventListener('load', () => {
    if (PHOTO && PICK && btnRESOLUTION && SELECT && btnCOLOR && btnDOWNLOAD && BTN) {
        PHOTO.style.display = 'none'; // notshow photo
        PICK.style.display = 'none'; // notshow resolution
        btnRESOLUTION.style.display = 'none'; // notshow transform resolution
        SELECT.style.display = 'none'; // notshow dither list
        btnCOLOR.style.display = 'none'; // notshow dither button
        btnDOWNLOAD.style.display = 'none'; // notshow download button
        BTN.style.display = 'none'; // not show home button

        fetch('/delete', { // clear downloads
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
            })
            .catch(error => {
                console.error('404', error);
            });
    }
});

var ALLOWED: string[] = ['bmp', 'png', 'jpg', 'jpeg']; // allow types
var selectedFiles: File[] = []; // save files
var selectedFilesNames: string[] = []; // save filenames
if (FILE) {
    FILE.addEventListener('change', () => {
        if (FILE.files && FILE.files.length > 0) {
            var ALLOW: boolean = true; // pick files

            for (var i = 0; i < FILE.files.length; i++) {
                var fileName: string = FILE.files[i].name;
                var fileExtension: string = fileName.split('.').pop()!.toLowerCase(); // check filenames
                if (!ALLOWED.includes(fileExtension)) {
                    function alert(): void {
                        var alert: HTMLElement | null = document.getElementById('alert');
                        if (alert) {
                            alert.style.display = 'block';

                            setTimeout(function () {
                                if (alert) {
                                    alert.style.display = 'none';
                                }
                            }, 2000);
                        }
                    }
                    alert();

                    FILE.value = '';
                    ALLOW = false;
                }
            }

            if (ALLOW) {
                selectedFilesNames = []; // clear save filenames

                for (var i = 0; i < FILE.files.length; i++) {
                    var fileName: string = FILE.files[i].name;
                    var isSelected: boolean = false; // check files

                    for (var j = 0; j < selectedFiles.length; j++) {
                        if (selectedFiles[j].name === fileName) {
                            isSelected = true;
                        }
                    }

                    if (isSelected) {
                        function alert0(): void {
                            var alert0: HTMLElement | null = document.getElementById('alert0');
                            if (alert0) {
                                alert0.style.display = 'block';

                                setTimeout(function () {
                                    if (alert0) {
                                        alert0.style.display = 'none';
                                    }
                                }, 1000);
                            }
                        }
                        alert0();
                    } else {
                        selectedFiles.push(FILE.files[i]);
                        selectedFilesNames.push(fileName);
                    }
                }
                if (STR) {
                    STR.style.display = 'none'; // notshow list word
                }

                for (var i = 0; i < selectedFilesNames.length; i++) {
                    var DIV: HTMLElement = document.createElement('span');
                    DIV.innerHTML = selectedFilesNames[i];
                    var btn: HTMLButtonElement = document.createElement('button');
                    btn.innerText = '刪除';
                    if (LIST) {
                        LIST.appendChild(DIV);
                        LIST.appendChild(btn);
                        LIST.appendChild(document.createElement('br'));
                    }
                }
            }
            FILE.value = ''; // clear files
            ALLOW = true;
            isSelected = false;
        }
    });
}

if (LIST) {
    LIST.addEventListener('click', (event) => {
        if (event.target && event.target.tagName === 'BUTTON') {
            var btn: HTMLButtonElement = event.target;
            var span: HTMLElement | null = btn.previousElementSibling; // button previous
            var BR: HTMLElement | null = btn.nextElementSibling; // button next
            if (span && span.tagName === 'SPAN') {
                var fileName: string = span.innerHTML;

                for (var i = 0; i < selectedFiles.length; i++) {
                    if (selectedFiles[i].name === fileName) {
                        selectedFiles.splice(i, 1);
                        break;
                    }
                }

                var index: number = selectedFilesNames.indexOf(fileName);
                if (index !== -1) {
                    selectedFilesNames.splice(index, 1);
                }

                if (span) {
                    span.remove();
                }
                btn.remove();
                if (BR) {
                    BR.remove();
                }

                if (LIST.querySelectorAll('button').length === 0) {
                    preventBeforeUnload = false;
                    location.reload();
                }
            }
        }
    });
}

if (UPLOAD) {
    UPLOAD.addEventListener('click', () => {
        if (selectedFiles.length > 0) {
            showLoader();

            ToServer(selectedFiles);
        } else {
            function alert1(): void {
                var alert1: HTMLElement | null = document.getElementById('alert1');
                if (alert1) {
                    alert1.style.display = 'block';

                    setTimeout(function () {
                        if (alert1) {
                            alert1.style.display = 'none';
                        }
                    }, 1000);
                }
            }
            alert1();
        }
    });
}

function ToServer(file: File[]): void {
    var formData: FormData = new FormData();

    for (var i = 0; i < file.length; i++) {
        formData.append('file', file[i]);
    }

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            hideLoader();

            if (DIV) {
                DIV.style.display = 'none';
            }

            if (PHOTO && PICK && btnRESOLUTION && BTN) {
                PHOTO.style.display = 'block'; // show photo preview
                PHOTO0 = PHOTO.style.display;
                PHOTO1 = PHOTO.style.position;
                PICK.style.display = 'block'; // show resolution pick
                PICK0 = PICK.style.display;
                PICK1 = PICK.style.position;
                btnRESOLUTION.style.display = 'block'; // show transform resolution
                btnRESOLUTION0 = btnRESOLUTION.style.display;
                btnRESOLUTION1 = btnRESOLUTION.style.position;
                BTN.style.display = 'block'; // show home button
                BTN0 = BTN.style.display;
                BTN1 = BTN.style.position;
            }

            data.files.forEach((file: any) => {
                var btn: HTMLButtonElement = document.createElement('button');
                btn.innerText = '刪除';
                var LABEL: HTMLLabelElement = document.createElement('label');
                LABEL.innerHTML = file.originalname;
                var img: HTMLImageElement = document.createElement('img');
                img.src = file.url;
                img.alt = file.originalname;
                img.style.width = '333px';
                if (PHOTO) {
                    PHOTO.appendChild(LABEL);
                    PHOTO.appendChild(img);
                    PHOTO.appendChild(btn);
                    PHOTO.appendChild(document.createElement('br'));
                }
            });
        })
        .catch(error => {
            console.error('404', error);
        });
}

if (PHOTO) {
    PHOTO.addEventListener('click', (event) => {
        if (event.target && event.target.tagName === 'BUTTON') {
            var btn: HTMLButtonElement = event.target;
            var img: HTMLImageElement | null = btn.previousElementSibling;
            var label: HTMLLabelElement | null = img ? img.previousElementSibling : null;
            if (img && img.tagName === 'IMG') {
                var filename: string = img.alt;

                if (PHOTO.querySelectorAll('button').length === 1) {
                    var ALERT: boolean = window.confirm('刪除此圖檔將重新載入頁面');
                    if (!ALERT) {
                        return;
                    } else {
                        preventBeforeUnload = false;
                        location.reload();
                    }
                }

                fetch('/cut', { // delete server preview images
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ filename: filename })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                    })
                    .catch(error => {
                        console.error('404', error);
                    });

                if (img) {
                    img.remove();
                }
                if (label) {
                    label.remove();
                }
                btn.remove();
            }
        }
    });
}

if (RESOLUTION) {
    RESOLUTION.addEventListener('click', async () => {
        var imgElements: HTMLCollectionOf<HTMLImageElement> = PHOTO ? PHOTO.getElementsByTagName('img') : [];
        var selectedResolution: string = PICK ? PICK.value : '';

        if (selectedResolution === '請選擇解析度') {
            function alert6(): void {
                var alert6: HTMLElement | null = document.getElementById('alert6');
                if (alert6) {
                    alert6.style.display = 'block';

                    setTimeout(function () {
                        if (alert6) {
                            alert6.style.display = 'none';
                        }
                    }, 1000);
                }
            }
            alert6();
        } else if (imgElements.length > 0) {
            var resolutions: any[] = [];

            for (var i = 0; i < imgElements.length; i++) {
                var img: HTMLImageElement = imgElements[i];
                var imageURL: string = img.src;
                var filename: string = imageURL.substring(imageURL.lastIndexOf('/') + 1);

                var resolutionData = {
                    filename: filename,
                    imageURL: imageURL,
                    resolution: selectedResolution
                };
                resolutions.push(resolutionData);
            }

            if (PHOTO && PICK && btnRESOLUTION) {
                PHOTO.innerHTML = '';
                PICK.style.display = 'none'; // notshow resolution list
                btnRESOLUTION.style.display = 'none'; // notshow resolution button
            }

            showLoader();

            function alert5(): void {
                var alert5: HTMLElement | null = document.getElementById('alert5');
                if (alert5) {
                    alert5.style.display = 'block';

                    setTimeout(function () {
                        if (alert5) {
                            alert5.style.display = 'none';
                        }
                    }, 1000);
                }
            }
            alert5();

            var response = await fetch('/api', { // resolution
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resolutions)
            })
                .then(response => response.json())
                .then(data => {
                    if (SELECT) {
                        SELECT.style.display = 'block'; // show menu
                        SELECT0 = SELECT.style.display;
                        SELECT1 = SELECT.style.position;
                    }

                    function processFiles(files: any[]): Promise<void> {
                        return new Promise((resolve) => {
                            files.forEach((file) => {
                                var LABEL: HTMLLabelElement = document.createElement('label');
                                LABEL.innerHTML = file.filename;
                                var imgs: HTMLImageElement = document.createElement('img');
                                imgs.src = file.processedImageURL;
                                imgs.alt = file.filename;
                                imgs.style.width = '333px';
                                if (PHOTO) {
                                    PHOTO.appendChild(LABEL);
                                    PHOTO.appendChild(imgs);
                                    PHOTO.appendChild(document.createElement('br'));
                                }
                            });

                            resolve();
                        });
                    }

                    processFiles(data).then(() => {
                        hideLoader();
                        if (btnCOLOR) {
                            btnCOLOR.style.display = 'block'; // show dither button
                            btnCOLOR0 = btnCOLOR.style.display;
                            btnCOLOR1 = btnCOLOR.style.position;
                        }
                    });
                })
                .catch(error => {
                    console.error('404', error);
                });
        }
    });
}

var processedImages: any[] = [];

if (COLOR) {
    COLOR.addEventListener('click', () => {
        var ing: any[] = [];

        if (SELECT && SELECT.value === '請選擇色盤') {
            function alert7(): void {
                var alert7: HTMLElement | null = document.getElementById('alert7');
                if (alert7) {
                    alert7.style.display = 'block';

                    setTimeout(function () {
                        if (alert7) {
                            alert7.style.display = 'none';
                        }
                    }, 1000);
                }
            }
            alert7();

            return;
        }

        showLoader();

        function alert2(): void {
            var alert2: HTMLElement | null = document.getElementById('alert2');
            if (alert2) {
                alert2.style.display = 'block';

                setTimeout(function () {
                    if (alert2) {
                        alert2.style.display = 'none';
                    }
                }, 1000);
            }
        }
        alert2();

        if (SELECT && SELECT.value === '黑白紅黃') {
            ing = [
                { "r": 0, "g": 0, "b": 0, "a": 255 }, // black
                { "r": 255, "g": 255, "b": 255, "a": 255 }, // white
                { "r": 255, "g": 0, "b": 0, "a": 255 }, // red
                { "r": 255, "g": 255, "b": 0, "a": 255 } // yellow
            ];
            performDithering(ing);
        } else if (SELECT && SELECT.value === '六色') {
            ing = [
                { "r": 255, "g": 0, "b": 0, "a": 255 }, // red
                { "r": 255, "g": 165, "b": 0, "a": 255 }, // orange
                { "r": 255, "g": 255, "b": 0, "a": 255 }, // yellow
                { "r": 0, "g": 128, "b": 0, "a": 255 },// green
                { "r": 0, "g": 0, "b": 255, "a": 255 }, // blue
                { "r": 128, "g": 0, "b": 128, "a": 255 } // purple
            ];
            performDithering(ing);
        }
    });
}

async function performDithering(ing: any[]): Promise<void> {
    if (PHOTO && SELECT && btnCOLOR) {
        PHOTO.innerHTML = '';
        SELECT.style.display = 'none'; // notshow menu
        btnCOLOR.style.display = 'none';// notshow dither button
    }

    showLoader();

    await fetch('/dithering', { // dither
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dither: ing })
    })
        .then(response => response.json())
        .then(data => {
            function alert3(): void {
                var alert3: HTMLElement | null = document.getElementById('alert3');
                if (alert3) {
                    alert3.style.display = 'block';

                    setTimeout(function () {
                        if (alert3) {
                            alert3.style.display = 'none';
                        }
                    }, 1000);
                }
            }
            alert3();

            processedImages = data.files;

            function processFiles(files: any[]): Promise<void> {
                return new Promise((resolve) => {
                    files.forEach((file) => {
                        var LABEL: HTMLLabelElement = document.createElement('label');
                        LABEL.innerHTML = file.originalname;
                        var imgs: HTMLImageElement = document.createElement('img');
                        imgs.src = `${file.url}?t=${Date.now()}`; // browser mistake
                        imgs.alt = file.originalname;
                        imgs.style.width = '333px';
                        if (PHOTO) {
                            PHOTO.appendChild(LABEL);
                            PHOTO.appendChild(imgs);
                            PHOTO.appendChild(document.createElement('br'));
                        }
                    });

                    resolve();
                });
            }

            processFiles(data.files).then(() => {
                hideLoader();
                if (btnDOWNLOAD) {
                    btnDOWNLOAD.style.display = 'block'; // show download button
                }
            });
        })
        .catch(error => {
            console.error('404', error);
        });
}

if (DOWNLOAD) {
    DOWNLOAD.addEventListener('click', async () => {
        showLoader();

        function alert4(): void {
            var alert4: HTMLElement | null = document.getElementById('alert4');
            if (alert4) {
                alert4.style.display = 'block';

                setTimeout(function () {
                    if (alert4) {
                        alert4.style.display = 'none';
                    }
                }, 1000);
            }
        }
        alert4();

        var downloadLinksContainer: HTMLElement | null = document.getElementById('download');
        if (downloadLinksContainer) {
            downloadLinksContainer.innerHTML = '';
        }

        processedImages.forEach(processedImage => {
            var { originalname, url } = processedImage;

            var downloadURL: string = url;

            var downloadLink: HTMLAnchorElement = document.createElement('a');
            downloadLink.href = downloadURL;
            downloadLink.download = originalname;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        });

        hideLoader();
    });
}

if (BTN) {
    BTN.addEventListener('click', () => {
        if (confirm('資料將會消失，確定離開本頁?')) {
            preventBeforeUnload = false;
            location.reload();
        }
    });
}
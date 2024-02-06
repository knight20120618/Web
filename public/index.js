var preventBeforeUnload = true; // initial value
window.addEventListener('beforeunload', function (event) {
    event.preventDefault(); // preventdefault

    if (preventBeforeUnload) {
        var CONFIRM = confirm('');
        event.returnValue = CONFIRM; // show alert
    }
});

var BTN = document.getElementById('BTN'); // home button
var FILE = document.getElementById('file'); // files pick
var LIST = document.getElementById('list'); // show list
var STR = document.getElementById('str'); // show list word
var UPLOAD = document.getElementById('upload'); // upload button
var DIV = document.getElementById('DIV');
var PHOTO = document.getElementById('photo'); // show photo
var PICK = document.getElementById('width-height'); // resolution pick
var RESOLUTION = document.getElementById('resolution'); // transform resolution
var btnRESOLUTION = document.getElementById('RESOLUTION');
var SELECT = document.getElementById('select'); // show menu
var COLOR = document.getElementById('color'); // dither button
var btnCOLOR = document.getElementById('COLOR');
var DOWNLOAD = document.getElementById('download'); // download button
var btnDOWNLOAD = document.getElementById('DOWNLOAD');

var PHOTO0 = PHOTO.style.display;  // photo site
var PHOTO1 = PHOTO.style.position;
var SELECT0 = SELECT.style.display; // menu site
var SELECT1 = SELECT.style.position;
var btnCOLOR0 = btnCOLOR.style.display; // dither button site
var btnCOLOR1 = btnCOLOR.style.position;
var PICK0 = PICK.style.display; // resolution site
var PICK1 = PICK.style.position;
var btnRESOLUTION0 = btnRESOLUTION.style.display; // transform resolution site
var btnRESOLUTION1 = btnRESOLUTION.style.position;
var btnDOWNLOAD0 = btnDOWNLOAD.style.display; // download button site
var btnDOWNLOAD1 = btnDOWNLOAD.style.position;
var BTN0 = BTN.style.display; // home button
var BTN1 = BTN.style.position;

var loaderwrapper = document.getElementById("loader-wrapper"); // animation
var loader = document.getElementById("loader");
function showLoader() { // show animation
    loaderwrapper.style.display = 'flex';
    loader.style.display = "block";
}
function hideLoader() { // notshow animation
    loaderwrapper.style.display = "none";
    loader.style.display = "none";
}

window.addEventListener('load', () => {
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
});

var ALLOWED = ['bmp', 'png', 'jpg', 'jpeg']; // allow types
var selectedFiles = []; // save files
var selectedFilesNames = []; // save filenames
FILE.addEventListener('change', () => {
    if (FILE.files.length > 0) {
        var ALLOW = true; // pick files

        for (var i = 0; i < FILE.files.length; i++) {
            var fileName = FILE.files[i].name;
            var fileExtension = fileName.split('.').pop().toLowerCase(); // check filenames
            if (!ALLOWED.includes(fileExtension)) {
                function alert() {
                    var alert = document.getElementById('alert');
                    alert.style.display = 'block';

                    setTimeout(function () {
                        alert.style.display = 'none';
                    }, 2000);
                }
                alert();

                FILE.value = '';
                ALLOW = false;
            }
        }

        if (ALLOW) {
            selectedFilesNames = []; // clear save filenames

            for (var i = 0; i < FILE.files.length; i++) {
                var fileName = FILE.files[i].name;
                var isSelected = false; // check files

                for (var j = 0; j < selectedFiles.length; j++) {
                    if (selectedFiles[j].name === fileName) {
                        isSelected = true;
                    }
                }

                if (isSelected) {
                    function alert0() {
                        var alert0 = document.getElementById('alert0');
                        alert0.style.display = 'block';

                        setTimeout(function () {
                            alert0.style.display = 'none';
                        }, 1000);
                    }
                    alert0();
                } else {
                    selectedFiles.push(FILE.files[i]);
                    selectedFilesNames.push(fileName);
                }
            }
            STR.style.display = 'none'; // notshow list word

            for (var i = 0; i < selectedFilesNames.length; i++) {
                var DIV = document.createElement('span');
                DIV.innerHTML = selectedFilesNames[i];
                var btn = document.createElement('button');
                btn.innerText = '刪除';
                LIST.appendChild(DIV);
                LIST.appendChild(btn);
                LIST.appendChild(document.createElement('br'));
            }
        }
        FILE.value = ''; // clear files
        ALLOW = true;
        isSelected = false;
    }
});

LIST.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        var btn = event.target;
        var span = btn.previousElementSibling; // button previous
        var BR = btn.nextElementSibling; // button next
        if (span && span.tagName === 'SPAN') {
            var fileName = span.innerHTML;

            for (var i = 0; i < selectedFiles.length; i++) {
                if (selectedFiles[i].name === fileName) {
                    selectedFiles.splice(i, 1);
                    break;
                }
            }

            var index = selectedFilesNames.indexOf(fileName);
            if (index !== -1) {
                selectedFilesNames.splice(index, 1);
            }

            span.remove();
            btn.remove();
            BR.remove();

            if (LIST.querySelectorAll('button').length === 0) {
                preventBeforeUnload = false;
                location.reload();
            }
        }
    }
});

UPLOAD.addEventListener('click', () => {
    if (selectedFiles.length > 0) {
        showLoader();

        ToServer(selectedFiles);
    } else {
        function alert1() {
            var alert1 = document.getElementById('alert1');
            alert1.style.display = 'block';

            setTimeout(function () {
                alert1.style.display = 'none';
            }, 1000);
        }
        alert1();
    }
})
function ToServer(file) {
    var formData = new FormData();

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

            DIV.style.display = 'none';

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

            data.files.forEach((file) => {
                var btn = document.createElement('button');
                btn.innerText = '刪除';
                var LABEL = document.createElement('label');
                LABEL.innerHTML = file.originalname;
                var img = document.createElement('img');
                img.src = file.url;
                img.alt = file.originalname;
                img.style.width = '333px';
                PHOTO.appendChild(LABEL);
                PHOTO.appendChild(img);
                PHOTO.appendChild(btn);
                PHOTO.appendChild(document.createElement('br'));
            });
        })
        .catch(error => {
            console.error('404', error);
        });
}

PHOTO.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        var btn = event.target;
        var img = btn.previousElementSibling;
        var label = img.previousElementSibling;
        if (img && img.tagName === 'IMG') {
            var filename = img.alt;

            if (PHOTO.querySelectorAll('button').length === 1) {
                var ALERT = window.confirm('刪除此圖檔將重新載入頁面');
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

            img.remove();
            label.remove();
            btn.remove();
        }
    }
});

RESOLUTION.addEventListener('click', async () => {
    var imgElements = PHOTO.getElementsByTagName('img');
    var selectedResolution = PICK.value;

    if (selectedResolution === '請選擇解析度') {
        function alert6() {
            var alert6 = document.getElementById('alert6');
            alert6.style.display = 'block';

            setTimeout(function () {
                alert6.style.display = 'none';
            }, 1000);
        }
        alert6();
    } else if (imgElements.length > 0) {
        var resolutions = [];

        for (var i = 0; i < imgElements.length; i++) {
            var img = imgElements[i];
            var imageURL = img.src;
            var filename = imageURL.substring(imageURL.lastIndexOf('/') + 1);

            var resolutionData = {
                filename: filename,
                imageURL: imageURL,
                resolution: selectedResolution
            };
            resolutions.push(resolutionData);
        }

        PHOTO.innerHTML = '';
        PICK.style.display = 'none'; // notshow resolution list
        btnRESOLUTION.style.display = 'none'; // notshow resolution button

        showLoader();

        function alert5() {
            var alert5 = document.getElementById('alert5');
            alert5.style.display = 'block';

            setTimeout(function () {
                alert5.style.display = 'none';
            }, 1000);
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
                SELECT.style.display = 'block'; // show menu
                SELECT0 = SELECT.style.display;
                SELECT1 = SELECT.style.position;

                function processFiles(files) {
                    return new Promise((resolve) => {
                        files.forEach((file) => {
                            var LABEL = document.createElement('label');
                            LABEL.innerHTML = file.filename;
                            var imgs = document.createElement('img');
                            imgs.src = file.processedImageURL;
                            imgs.alt = file.filename;
                            imgs.style.width = '333px';
                            PHOTO.appendChild(LABEL);
                            PHOTO.appendChild(imgs);
                            PHOTO.appendChild(document.createElement('br'));
                        });

                        resolve();
                    });
                }

                processFiles(data).then(() => {
                    hideLoader();
                    btnCOLOR.style.display = 'block'; // show dither button
                    btnCOLOR0 = btnCOLOR.style.display;
                    btnCOLOR1 = btnCOLOR.style.position;
                });
            })
            .catch(error => {
                console.error('404', error);
            });
    }
});

var processedImages = [];

COLOR.addEventListener('click', () => {
    var ing = [];

    if (SELECT.value === '請選擇色盤') {
        function alert7() {
            var alert7 = document.getElementById('alert7');
            alert7.style.display = 'block';

            setTimeout(function () {
                alert7.style.display = 'none';
            }, 1000);
        }
        alert7();

        return;
    }

    showLoader();

    function alert2() {
        var alert2 = document.getElementById('alert2');
        alert2.style.display = 'block';

        setTimeout(function () {
            alert2.style.display = 'none';
        }, 1000);
    }
    alert2();

    if (SELECT.value === '黑白紅黃') {
        ing = [
            { "r": 0, "g": 0, "b": 0, "a": 255 }, // black
            { "r": 255, "g": 255, "b": 255, "a": 255 }, // white
            { "r": 255, "g": 0, "b": 0, "a": 255 }, // red
            { "r": 255, "g": 255, "b": 0, "a": 255 } // yellow
        ];
        performDithering(ing);
    } else if (SELECT.value === '六色') {
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
async function performDithering(ing) {
    PHOTO.innerHTML = '';
    SELECT.style.display = 'none'; // notshow menu
    btnCOLOR.style.display = 'none';// notshow dither button

    await fetch('/dithering', { // dither
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dither: ing })
    })
        .then(response => response.json())
        .then(data => {
            function alert3() {
                var alert3 = document.getElementById('alert3');
                alert3.style.display = 'block';

                setTimeout(function () {
                    alert3.style.display = 'none';
                }, 1000);
            }
            alert3();

            processedImages = data.files;

            function processFiles(files) {
                return new Promise((resolve) => {
                    files.forEach((file) => {
                        var LABEL = document.createElement('label');
                        LABEL.innerHTML = file.originalname;
                        var imgs = document.createElement('img');
                        imgs.src = `${file.url}?t=${Date.now()}`; // browser mistake
                        imgs.alt = file.originalname;
                        imgs.style.width = '333px';
                        PHOTO.appendChild(LABEL);
                        PHOTO.appendChild(imgs);
                        PHOTO.appendChild(document.createElement('br'));
                    });

                    resolve();
                });
            }

            processFiles(data.files).then(() => {
                hideLoader();
                btnDOWNLOAD.style.display = 'block'; // show download button
            });
        })
        .catch(error => {
            console.error('404', error);
        });
}

DOWNLOAD.addEventListener('click', async () => {
    showLoader();

    function alert4() {
        var alert4 = document.getElementById('alert4');
        alert4.style.display = 'block';

        setTimeout(function () {
            alert4.style.display = 'none';
        }, 1000);
    }
    alert4();

    var downloadLinksContainer = document.getElementById('download');
    downloadLinksContainer.innerHTML = '';

    processedImages.forEach(processedImage => {
        var { originalname, url } = processedImage;

        var downloadURL = url;

        var downloadLink = document.createElement('a');
        downloadLink.href = downloadURL;
        downloadLink.download = originalname;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });

    hideLoader();
});

BTN.addEventListener('click', () => {
    if (confirm('資料將會消失，確定離開本頁?')) {
        preventBeforeUnload = false;
        location.reload();
    }
});
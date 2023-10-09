// 共通で使用
let fileArray;
// ファイル形式を定義
const fileFormats = {
    html: ['html'],
    text: ['js', 'css', 'txt', 'scss', 'ts'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'tif', 'bmp', 'webp'],
    video: ['mp4', 'avi', 'mob', 'webm', 'flv', 'wmv', 'mpg', 'mkv'],
    audio: ['wav', 'aiff', 'mp3', 'wma', 'aac'],
    pdf: ['pdf']
};


// 検索ボタンのクリックイベントを処理
document.getElementById('searchButton').addEventListener('click', function () {
    const searchKeyword = document.getElementById('searchKeyword').value.trim().toLowerCase();
    searchFiles(searchKeyword);
});


// ファイル検索処理
function searchFiles(searchKeyword) {
    clearList();
    // 検索ワードが空白の場合、全てのファイルを表示
    if (!searchKeyword && fileArray !== undefined) {
        displayFolderContents(fileArray);
        return;
    }

    if (Symbol.iterator in Object(fileArray)) {
        fileArray.forEach(async (file) => {
            const fileExtension = getFileExtension(file.name).toLowerCase();
            if (fileFormats.text.includes(fileExtension) || fileFormats.html.includes(fileExtension)) {
                const fileContent = await readFileAsText(file);

                if (fileContent.toLowerCase().includes(searchKeyword)) {
                    displayFile(file);
                }
            }
        });
    }
}

function getFileExtension(fileName) {
    return fileName.split('.').pop();
}

// 検索結果を表示
function displayFile(file) {
    // ファイル名を取得
    const fileName = file.name;
    const fileItem = document.createElement('li');
    fileItem.innerHTML = `<i class="fas fa-file"></i> ${fileName}`;
    fileItem.setAttribute('data-filename', fileName); // ファイル名を属性として設定
    const fileList = document.getElementById('fileList');
    fileList.appendChild(fileItem);
    fileItem.addEventListener('click', displayFileContent);
}


// フォルダとファイルを表示
function displayFolderContents(files) {
    clearList();
    const fileList = document.getElementById('fileList');
    fileArray = Array.from(files);
    const rootItems = [];
    fileArray.forEach(file => {
        const path = file.webkitRelativePath;
        const pathParts = path.split('/');
        let currentItems = rootItems;

        pathParts.forEach((part, index) => {
            const existingItem = currentItems.find(item => item.name === part);

            if (existingItem) {
                currentItems = existingItem.isDirectory ? existingItem.items : currentItems;
            } else {
                const newItem = {
                    name: part,
                    isDirectory: index < pathParts.length - 1,
                    items: []
                };

                currentItems.push(newItem);
                currentItems = newItem.isDirectory ? newItem.items : currentItems;
            }
        });
    });

    // ルートフォルダから表示
    displayHierarchy(rootItems, fileList);

    function displayHierarchy(folder, parentElement, indentLevel = 0) {
        folder.forEach(item => {
            const itemName = item.name;

            const listItem = document.createElement('div');
            listItem.innerHTML = '│'.repeat(indentLevel) + (indentLevel > 0 ? '├─ ' : '') +
                `<i class="${item.isDirectory ? 'fas fa-folder' : 'fas fa-file'}"></i> ${itemName} `;
            if (item.isDirectory) {
                listItem.classList.add('folder');
                parentElement.appendChild(listItem);

                const sublist = document.createElement('div');
                sublist.style.display = 'none';
                listItem.appendChild(sublist);

                listItem.addEventListener('click', toggleFolder);
                displayHierarchy(item.items, sublist, indentLevel + 1);
            } else {
                listItem.classList.add('file');
                listItem.setAttribute('data-filename', itemName);
                parentElement.appendChild(listItem);
                listItem.addEventListener('click', displayFileContent);
            }
        });
    }

    function toggleFolder(event) {
        event.stopPropagation();
        const folderElement = event.currentTarget;
        const sublist = folderElement.querySelector('div');

        // sublist が存在する場合のみスタイルを切り替え
        if (sublist) {
            if (sublist.style.display === 'none') {
                sublist.style.display = 'block';
            } else {
                sublist.style.display = 'none';
            }
        }
    }
}


// ファイルをクリックした際の動作
async function displayFileContent(event) {
    event.stopPropagation();
    const fileElement = event.currentTarget;
    const fileName = fileElement.getAttribute('data-filename');
    const file = fileArray.find(file => file.name === fileName);
    const fileExtension = fileName.split('.').pop().toLowerCase();

    if (fileFormats.html.includes(fileExtension)) {
        // HTMLファイルの場合、TinyMCEエディターに表示
        const fileContent = await readFileAsText(file);
        setTinyMCEContent(fileContent);
    } else if (fileFormats.text.includes(fileExtension)) {
        // テキスト形式
        const fileContent = await readFileAsText(file);
        openNewWindowWithContent(fileContent);
    } else if (fileFormats.image.includes(fileExtension)) {
        // 画像
        openNewWindowWithImage(file);
    } else if (fileFormats.video.includes(fileExtension)) {
        // 動画
        openNewWindowWithVideo(file);
    } else if (fileFormats.audio.includes(fileExtension)) {
        // 音楽
        openNewWindowWithAudio(file);
    } else if (fileFormats.pdf.includes(fileExtension)) {
        // PDF
        openNewWindowWithPDF(file);
    }

    // すでに表示されているファイル内容を削除
    clearFileContent();
}

// メディアに応じた処理
function openNewWindowWithContent(content, contentType) {
    const newWindow = window.open('', '_blank');
    newWindow.document.open();
    newWindow.document.write(`<pre>${content}</pre>`);
    newWindow.document.close();
}

function openNewWindowWithFile(file, contentType) {
    const fileURL = URL.createObjectURL(file);
    const newWindow = window.open(fileURL, '_blank');
    if (newWindow) {
        newWindow.focus();
    } else {
        alert('新しいウィンドウがブロックされたか、ポップアップが無効になっています。');
    }
}

function openNewWindowWithImage(file) {
    const imgTag = `<img src="${URL.createObjectURL(file)}" />`;
    openNewWindowWithContent(imgTag, 'image/*');
}

function openNewWindowWithAudio(file) {
    openNewWindowWithFile(file, 'audio/*');
}

function openNewWindowWithPDF(file) {
    openNewWindowWithFile(file, 'application/pdf');
}

function clearFileContent() {
    const fileContentElement = document.getElementById('fileContent');
    fileContentElement.innerHTML = '';
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
            resolve(event.target.result);
        };
        reader.onerror = event => {
            reject(event.target.error);
        };
        reader.readAsText(file);
    });
}

function clearList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
}

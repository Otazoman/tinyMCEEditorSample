// オリジナルHTMLを保持する
let originHtml = '';

const initialConfig = {
    selector: '#editor',
    language: 'ja',
    language_url: './langs/ja.js',
    branding: false,
    plugins: 'link image code codesample table lists media visualblocks wordcount preview save textpattern',
    textpattern_patterns: [
        { start: '*', end: '*', format: 'italic' },
        { start: '**', end: '**', format: 'bold' },
        { start: '#', format: 'h1' },
        { start: '##', format: 'h2' },
        { start: '###', format: 'h3' },
        { start: '####', format: 'h4' },
        { start: '#####', format: 'h5' },
        { start: '######', format: 'h6' },
        { start: '1. ', cmd: 'InsertOrderedList' },
        { start: '* ', cmd: 'InsertUnorderedList' },
        { start: '- ', cmd: 'InsertUnorderedList' },
        { start: '//brb', replacement: 'Be Right Back' }
    ],
    codesample_languages: [
        { text: 'HTML/XML', value: 'markup' },
        { text: 'JavaScript', value: 'javascript' },
        { text: 'CSS', value: 'css' },
        { text: 'PHP', value: 'php' },
        { text: 'Ruby', value: 'ruby' },
        { text: 'Python', value: 'python' },
        { text: 'Java', value: 'java' },
        { text: 'C', value: 'c' },
        { text: 'C#', value: 'csharp' },
        { text: 'C++', value: 'cpp' }
    ],
    save_onsavecallback: () => {
        contentsSave();
    },
    menu: {
        file: {
            title: 'ファイル',
            items: 'newdocument preview print | save clearheader', // 既存の新規ドキュメントメニューとカスタムメニューを含める
        },
    },
    setup: (editor) => {
        editor.ui.registry.addButton('custom-preview', {
            icon: 'preview',
            tooltip: 'fullscreen preview',
            onAction: () => {
                contentsPreview();
            }
        });

        editor.ui.registry.addToggleButton('save', {
            icon: 'save',
            onAction: () => {
                contentsSave(); // 保存ボタンの処理を呼び出し
            },
        });

        editor.ui.registry.addMenuItem('clearheader', {
            text: 'ヘッダーのクリア',
            onAction: () => {
                clearHeader(); // ヘッダーをクリアする関数を呼び出し
            },
        });

        editor.ui.registry.addMenuItem('save', {
            text: 'save',
            onAction: () => {
                contentsSave(); // 保存ボタンの処理を呼び出し
            },
        });


    },
    toolbar: 'save custom-preview undo redo | blocks fontfamily fontsize | bold italic strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | media | code | codesample | table | visualblocks',
    menubar: 'file edit view insert format tools table help',
    height: 600
};


// TinyMCEを初期化
tinymce.init(initialConfig);

// エディタにコンテンツを表示
function setTinyMCEContent(content) {
    originHtml = content
    tinymce.get('editor').setContent(content);
}

// HTML生成
function editorContent() {
    //タイトル


    const titleText = document.getElementById('title').textContent;

    const content = tinymce.activeEditor.getContent();
    const indentedContent = content.split('\n').map(line => '    ' + line).join('\n');

    // 既存HTML読込時
    const existingHeader = getHeaderFromHTML(originHtml);
    const existingFooter = getFooterFromHTML(originHtml);
    let htmlContent = `${existingHeader}\n${indentedContent}\n${existingFooter}`;

    if (originHtml === '') {
        htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleText}</title>
</head>
<body>
${indentedContent}
</body>
</html>`;
    }
    return htmlContent
}

// オリジナルHTMLからヘッダーを取得する関数
function getHeaderFromHTML(htmlContent) {
    const match = htmlContent.match(/<!DOCTYPE[\s\S]*?<\/head>/i);
    return match ? match[0] : '';
}

// オリジナルHTMLからフッターを取得する関数
function getFooterFromHTML(htmlContent) {
    const match = htmlContent.match(/<\/body>[\s\S]*?<\/html>/i);
    return match ? match[0] : '';
}

// プレビューボタンのクリックイベントハンドラ
function contentsPreview() {
    const htmlContent = editorContent();

    // プレビューウィンドウにHTMLコンテンツを表示
    const previewWindow = window.open('', '_blank');
    previewWindow.document.open();
    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
}

// 保存
function contentsSave() {
    const htmlContent = editorContent();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const fileName = 'document.html';

    // ダウンロード
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    downloadLink.click();
    URL.revokeObjectURL(blob);
}

//ヘッダークリア
function clearHeader() {
    originHtml = '';
}
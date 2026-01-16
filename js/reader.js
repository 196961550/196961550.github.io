document.addEventListener('DOMContentLoaded', function() {
    // 阅读页面逻辑
    const dropZoneReader = document.getElementById('dropZone');
    const bookInput = document.getElementById('bookInput');
    const bookReader = document.getElementById('bookReader');
    const bookContent = document.getElementById('bookContent');
    const controls = document.getElementById('controls');
    const selectionScreen = document.getElementById('selectionScreen');
    let book, rendition;
    let currentFileType = '';

    // 鼠标悬停显示控制按钮（仅EPUB模式）
    document.addEventListener('mousemove', function(e) {
        if (currentFileType === 'epub') {
            const mouseY = e.clientY;
            const windowHeight = window.innerHeight;
            
            if (mouseY > windowHeight - 100) {
                controls.classList.add('visible');
            } else {
                controls.classList.remove('visible');
            }
        }
    });

    if (dropZoneReader && bookInput) {
        // 点击拖放区域触发文件选择
        dropZoneReader.addEventListener('click', function() {
            bookInput.click();
        });

        // 文件选择（图书）
        bookInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                const file = files[0];
                currentFileType = file.name.split('.').pop().toLowerCase();
                
                // 仅EPUB文件显示翻页按钮
                if (currentFileType === 'epub') {
                    controls.classList.add('epub-controls');
                } else {
                    controls.classList.remove('epub-controls');
                }
                
                // 创建新的FileReader实例
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    if (currentFileType === 'epub') {
                        renderEPUB(e.target.result);
                    } else if (currentFileType === 'txt') {
                        renderText(e.target.result);
                    } else {
                        alert('不支持的文件格式');
                        return;
                    }
                    selectionScreen.style.display = 'none';
                    bookReader.style.display = 'block';
                };
                
                reader.onerror = function() {
                    alert('文件读取失败，请重试');
                };
                
                if (currentFileType === 'epub') {
                    reader.readAsArrayBuffer(file);
                } else if (currentFileType === 'txt') {
                    reader.readAsText(file);
                }
            }
        });

        // 拖拽上传
        dropZoneReader.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZoneReader.style.border = '2px dashed #fff';
        });

        dropZoneReader.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZoneReader.style.border = '2px dashed white';
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                currentFileType = file.name.split('.').pop().toLowerCase();
                
                // 创建新的DataTransfer对象
                const dt = new DataTransfer();
                dt.items.add(file);
                bookInput.files = dt.files;
                
                // 手动触发change事件
                const event = new Event('change');
                bookInput.dispatchEvent(event);
            }
        });

        // 渲染 EPUB
        function renderEPUB(data) {
            // 如果已有book实例，先销毁
            if (book) {
                book.destroy();
            }
            
            book = ePub(data);
            rendition = book.renderTo(bookContent, {
                width: '100%',
                height: '100%',
                spread: 'none'
            });

            rendition.display().then(function() {
                const iframe = bookContent.querySelector('iframe');
                if (iframe) {
                    iframe.removeAttribute('sandbox');
                    iframe.style.pointerEvents = 'auto';
                    iframe.style.overflow = 'visible';

                    iframe.onload = function() {
                        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                        const iframeBody = iframeDocument.body;
                        const iframeHtml = iframeDocument.documentElement;

                        iframeBody.style.overflow = 'visible';
                        iframeHtml.style.overflow = 'visible';
                        iframeBody.style.width = '100%';
                        iframeBody.style.height = '100%';
                    };
                }
            });

            document.getElementById('prevPage').addEventListener('click', function() {
                rendition.prev();
            });

            document.getElementById('nextPage').addEventListener('click', function() {
                rendition.next();
            });

            // 键盘事件
            document.addEventListener('keydown', function(e) {
                if (currentFileType === 'epub') {
                    if (e.key === 'ArrowLeft') {
                        rendition.prev();
                    } else if (e.key === 'ArrowRight') {
                        rendition.next();
                    }
                }
            });
        }

        // 渲染 TXT 文件
        function renderText(text) {
            bookContent.innerHTML = `<pre style="padding: 20px; white-space: pre-wrap;">${text}</pre>`;
        }
    }
});
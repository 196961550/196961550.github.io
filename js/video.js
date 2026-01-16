document.addEventListener('DOMContentLoaded', function() {
    // 视频页面逻辑
    const dropZoneVideo = document.getElementById('dropZone');
    const mediaPlayer = document.getElementById('mediaPlayer');
    const fileInputVideo = document.getElementById('fileInput');

    if (dropZoneVideo && fileInputVideo) {
        // 点击拖放区域触发文件选择
        dropZoneVideo.addEventListener('click', function() {
            fileInputVideo.click(); // 触发文件选择
        });

        // 文件选择（视频）
        fileInputVideo.addEventListener('change', function() {
            const files = fileInputVideo.files;
            if (files.length > 0) {
                const file = files[0];
                if (mediaPlayer.src) {
                    URL.revokeObjectURL(mediaPlayer.src); // 释放之前的 URL
                }
                const url = URL.createObjectURL(file);
                mediaPlayer.src = url;
                mediaPlayer.style.display = 'block'; // 显示视频播放器
                dropZoneVideo.style.display = 'none'; // 隐藏拖放区域
                mediaPlayer.play()
                    .then(() => console.log('视频开始播放'))
                    .catch((error) => console.error('视频播放失败:', error));
            }
        });

        // 拖拽上传
        dropZoneVideo.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZoneVideo.style.border = '2px dashed #fff';
        });

        dropZoneVideo.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZoneVideo.style.border = '2px dashed white';
            const file = e.dataTransfer.files[0];
            if (file) {
                fileInputVideo.files = new DataTransfer().files; // 清空当前文件列表
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInputVideo.files = dt.files;
                fileInputVideo.dispatchEvent(new Event('change')); // 手动触发 change 事件
            }
        });
    }
});
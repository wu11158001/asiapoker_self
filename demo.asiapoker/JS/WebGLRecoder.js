var gameContainer = document.getElementById('gameContainer');
var recordedVideo = document.getElementById('recordedVideo');
var recordingSelect = document.getElementById('recordingSelect');
var mediaRecorder;
var recordedBlobs = [];
var recordings = [];
var recordingCount = 0;

//影片開始錄製
function StartRecording() {
    var canvas = gameContainer.querySelector('canvas');
    if (canvas) {
        var stream = canvas.captureStream(30);
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorder.ondataavailable = HandleDataAvailable;
        mediaRecorder.start();
        console.log('Recording started');
    } else {
        console.error('Canvas element not found!');
    }
}

//影片停止錄製
function StopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        console.log('Recording stopped');
    }
}

function HandleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

//影片錄製存檔
function SaveRecording() {
    var blob = new Blob(recordedBlobs, { type: 'video/webm' });
    recordings.push(blob);
    var url = window.URL.createObjectURL(blob);

    // 更新录制选择器
    var option = document.createElement('option');
    option.value = recordingCount;
    option.text = `Recording ${recordingCount + 1}`;
    recordingSelect.appendChild(option);
    recordingSelect.style.display = 'block';

    recordedBlobs = [];
    recordingCount++;
    if (recordingCount >= 3) {
        Unity.call('DisableStartButton');
    }
}

//影片暫停錄製
function PauseRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        console.log('Recording paused');
    }
}

//影片繼續錄製
function ResumeRecording() {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        console.log('Recording resumed');
    }
}

//播放錄製影片
function PlayRecording() {
    var selectedRecording = recordingSelect.value;
    if (selectedRecording !== "") {
        var blob = recordings[selectedRecording];
        var url = window.URL.createObjectURL(blob);
        recordedVideo.src = url;
        recordedVideo.style.display = 'block';
        recordedVideo.play();
    }
}

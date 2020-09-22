export default function (Room) {
    Room.openMedia = async function (e) {
        Room.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        document.getElementById('localVideo').srcObject = Room.stream;

        Room.localStream = Room.stream;

        Room.remoteStream = new MediaStream();

        document.getElementById('remoteVideo').srcObject = Room.remoteStream;

        console.log('Stream:', document.getElementById('localVideo').srcObject);

        document.getElementById('cameraBtn').disabled = true;
        document.getElementById('joinBtn').disabled = false;
        document.getElementById('createBtn').disabled = false;
        document.getElementById('hangupBtn').disabled = false;
    }

    document.getElementById('cameraBtn').addEventListener('click', Room.openMedia);
}
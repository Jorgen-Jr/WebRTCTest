export default async function (Room) {
    Room.hangUp = async function () {
        Room.tracks = document.getElementById('localVideo').srcObject.getTracks();

        Room.tracks.forEach(track => {
            track.stop();
        });

        if (Room.remoteStream) {
            Room.remoteStream.getTracks().forEach(track => track.stop());
        }

        if (Room.peerConnection) {
            Room.peerConnection.close();
        }

        document.getElementById('localVideo').srcObject = null;
        document.getElementById('remoteVideo').srcObject = null;
        document.getElementById('cameraBtn').disabled = false;
        document.getElementById('joinBtn').disabled = true;
        document.getElementById('createBtn').disabled = true;
        document.getElementById('hangupBtn').disabled = true;
        document.getElementById('currentRoom').innerText = '';

        // Delete room on hangup
        if (Room.roomId) {
            Room.db = firebase.firestore();
            Room.roomRef = Room.db.collection('rooms').doc(Room.roomId);
            Room.calleeCandidates = await Room.roomRef.collection('calleeCandidates').get();
            Room.calleeCandidates.forEach(async candidate => {
                await Room.candidate.ref.delete();
            });
            Room.callerCandidates = await Room.roomRef.collection('callerCandidates').get();
            Room.callerCandidates.forEach(async candidate => {
                await Room.candidate.ref.delete();
            });
            await Room.roomRef.delete();
        }
        document.location.reload(true);
    }

    document.querySelector('#hangupBtn').addEventListener('click', Room.hangUp);
}
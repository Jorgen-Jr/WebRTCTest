export default async function (Room) {
    Room.create = async function () {
        document.querySelector('#createBtn').disabled = true;
        document.querySelector('#joinBtn').disabled = true;

        Room.db = firebase.firestore();
        Room.roomRef = await Room.db.collection('rooms').doc();

        console.log('Create PeerConnection with configuration: ', Room.configuration);
        Room.peerConnection = new RTCPeerConnection(Room.configuration);

        Room.registerPeerConnectionListeners();

        Room.localStream.getTracks().forEach(track => {
            Room.peerConnection.addTrack(track, Room.localStream);
        });

        // Code for collecting ICE candidates below
        Room.callerCandidatesCollection = Room.roomRef.collection('callerCandidates');

        Room.peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            Room.callerCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        // Code for creating a room below
        Room.offer = await Room.peerConnection.createOffer();
        await Room.peerConnection.setLocalDescription(Room.offer);
        console.log('Created offer:', Room.offer);

        Room.roomWithOffer = {
            'offer': {
                type: Room.offer.type,
                sdp: Room.offer.sdp,
            },
        };

        await Room.roomRef.set(Room.roomWithOffer);
        Room.roomId = Room.roomRef.id;
        console.log(`New room created with SDP offer. Room ID: ${Room.roomRef.id}`);
        document.querySelector(
            '#currentRoom').innerText = `Current room is ${Room.roomRef.id} - You are the caller!`;
        // Code for creating a room above

        Room.peerConnection.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                Room.remoteStream.addTrack(track);
            });
        });

        // Listening for remote session description below
        Room.roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data();
            if (!Room.peerConnection.currentRemoteDescription && data && data.answer) {
                console.log('Got remote description: ', data.answer);
                Room.rtcSessionDescription = new RTCSessionDescription(data.answer);
                await Room.peerConnection.setRemoteDescription(Room.rtcSessionDescription);
            }
        });
        // Listening for remote session description above

        // Listen for remote ICE candidates below
        Room.roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await Room.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        // Listen for remote ICE candidates above
    }

    //Criar listener para criar novas salas
    document.querySelector('#createBtn').addEventListener('click', Room.create);
}
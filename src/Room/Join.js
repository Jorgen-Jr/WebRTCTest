export default function (Room) {
    Room.join = function () {
        document.getElementById('createBtn').disabled = true;
        document.getElementById('joinBtn').disabled = true;

        Room.roomId = document.getElementById('room-id').value

        document.getElementById('confirmJoinBtn').
            addEventListener('click', async () => {
                console.log('Join room: ', Room.roomId);
                
                document.getElementById('currentRoom').innerText = `Current room is ${Room.roomId} - You are the callee!`;
                await Room.joinId(Room.roomId);
            }, { once: true });

        Room.roomDialog.open();
    }

    Room.joinId = async function (roomId) {
        Room.db = firebase.firestore();
        Room.roomRef = Room.db.collection('rooms').doc(roomId);
        Room.roomSnapshot = await Room.roomRef.get();
        console.log('Got room:', Room.roomSnapshot.exists);

        if (Room.roomSnapshot.exists) {
            console.log('Create PeerConnection with configuration: ', Room.configuration);
            Room.peerConnection = new RTCPeerConnection(Room.configuration);
            Room.registerPeerConnectionListeners();
            Room.localStream.getTracks().forEach(track => {
                Room.peerConnection.addTrack(track, Room.localStream);
            });

            // Code for collecting ICE candidates below
            Room.calleeCandidatesCollection = Room.roomRef.collection('calleeCandidates');

            Room.peerConnection.addEventListener('icecandidate', event => {
                if (!event.candidate) {
                    console.log('Got final candidate!');
                    return;
                }
                console.log('Got candidate: ', event.candidate);
                Room.calleeCandidatesCollection.add(event.candidate.toJSON());
            });
            // Code for collecting ICE candidates above

            Room.peerConnection.addEventListener('track', event => {
                console.log('Got remote track:', event.streams[0]);
                event.streams[0].getTracks().forEach(track => {
                    console.log('Add a track to the remoteStream:', track);
                    Room.remoteStream.addTrack(track);
                });
            });

            // Code for creating SDP answer below
            Room.offer = Room.roomSnapshot.data().offer;
            
            console.log('Got offer:', Room.offer);
            await Room.peerConnection.setRemoteDescription(new RTCSessionDescription(Room.offer));

            Room.answer = await Room.peerConnection.createAnswer();

            console.log('Created answer:', Room.answer);
            await Room.peerConnection.setLocalDescription(Room.answer);

            Room.roomWithAnswer = {
                answer: {
                    type: Room.answer.type,
                    sdp: Room.answer.sdp,
                },
            };
            await Room.roomRef.update(Room.roomWithAnswer);
            // Code for creating SDP answer above

            // Listening for remote ICE candidates below
            Room.roomRef.collection('callerCandidates').onSnapshot(snapshot => {
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        let data = change.doc.data();
                        console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                        await Room.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });
            // Listening for remote ICE candidates above
        }
    }

    document.getElementById('joinBtn').addEventListener('click', Room.join);
}
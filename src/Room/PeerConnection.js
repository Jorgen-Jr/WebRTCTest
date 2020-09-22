export default function (Room) {
    Room.registerPeerConnectionListeners = function () {
        Room.peerConnection.addEventListener('icegatheringstatechange', () => {
            console.log(`ICE gathering state changed: ${Room.peerConnection.iceGatheringState}`);
        });

        Room.peerConnection.addEventListener('connectionstatechange', () => {
            console.log(`Connection state change: ${Room.peerConnection.connectionState}`);
        });

        Room.peerConnection.addEventListener('signalingstatechange', () => {
            console.log(`Signaling state change: ${Room.peerConnection.signalingState}`);
        });

        Room.peerConnection.addEventListener('iceconnectionstatechange ', () => {
            console.log(`ICE connection state change: ${Room.peerConnection.iceConnectionState}`);
        });
    }
}
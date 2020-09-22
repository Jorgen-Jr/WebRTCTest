import Config from '../Config/index.js'

export default function (Room) {
        Room.configuration = Config

        Room.peerConnection = null;
        Room.localStream = null;
        Room.remoteStream = null;
        Room.roomId = null;

        Room.roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
}
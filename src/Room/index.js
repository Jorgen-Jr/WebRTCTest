import Load from './Load.js'
import Media from './Media.js'
import Create from './Create.js'
import Join from './Join.js'
import HangUp from './HangUp.js'
import PeerConnection from './PeerConnection.js'

const Room = { }

Load(Room)
Media(Room)
Create(Room)
Join(Room)
HangUp(Room)
PeerConnection(Room)

export default Room
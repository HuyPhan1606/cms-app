import { io } from "socket.io-client";

const socket = io("http://huyphan23.workspace.opstech.org:8080", {
    autoConnect: true,
});

export default socket;

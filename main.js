
const remoteContainer = document.getElementById('remoteContainer');
const canvasContainer = document.getElementById('canvasContainer');
const rtc = {
    client: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {}
};

// Options for joining a channel
const option = {
    appID: "8fda7676e86b4444939845a1753390d4",
    channel: 'DNPNPZLEjS+nTMZMlpJj+Q==',
    uid: null,
    // token: "DNPNPZLEjS+nTMZMlpJj+Q=="
};

// Create a client
rtc.client = AgoraRTC.createClient({mode: "rtc", codec: "h264"});

// Initialize the client
function join(event){
  event.preventDefault();
  console.log(event);
}
rtc.client.init(option.appID, function () {
    console.log("init success");
    // Join a channel
    rtc.client.join(option.token, option.channel, option.uid, function (uid) {
        console.log("join channel: " + option.channel + " success, uid: " + uid);
        rtc.params.uid = uid;
        // Create a local stream
        rtc.localStream = AgoraRTC.createStream({
            streamID: rtc.params.uid,
            audio: true,
            video: true,
            screen: false,
        });
        console.log('LOCALSTREAM',rtc.localStream,rtc.params.uid);
        rtc.localStream.init(function () {
            console.log("init local stream success");
            // play stream with html element id "local_stream"
            rtc.localStream.play("local_stream");

            // Publish the local stream
            rtc.client.publish(rtc.localStream, function (err) {
                console.log("publish failed");
                console.error(err);
            });

            // Leave the channel
            // rtc.client.leave(function () {
            //     // Stop playing the local stream
            //     rtc.localStream.stop();
            //     // Close the local stream
            //     rtc.localStream.close();
            //     // Stop playing the remote streams and remove the views
            //     while (rtc.remoteStreams.length > 0) {
            //         var stream = rtc.remoteStreams.shift();
            //         var id = stream.getId();
            //         stream.stop();
            //         removeView(id);
            //     }
            //     console.log("client leaves channel success");
            // }, function (err) {
            //     console.log("channel leave failed");
            //     console.error(err);
            // });
        }, function (err) {
            console.error("init local stream failed ", err);
        });
    }, function(err) {
        console.error("client join failed", err);
    });
}, (err) => {
    console.error(err);
});

rtc.client.on("stream-added", function (evt) {
    var remoteStream = evt.stream;
    var id = remoteStream.getId();
    if (id !== rtc.params.uid) {
        rtc.client.subscribe(remoteStream, function (err) {
            console.log("stream subscribe failed", err);
        });
    }
    console.log("stream-added remote-uid: ", id);
});

rtc.client.on("stream-subscribed", function (evt) {
    var remoteStream = evt.stream;
    var id = remoteStream.getId();
    // Add a view for the remote stream.
    addView(id);
    // Play the remote stream.
    remoteStream.play("remote_video_" + id);
    console.log("stream-subscribed remote-uid: ", id);
});

rtc.client.on("stream-removed", function (evt) {
    var remoteStream = evt.stream;
    var id = remoteStream.getId();
    // Stop playing the remote stream.
    remoteStream.stop("remote_video_" + id);
    // Remove the view of the remote stream.
    removeView(id);
    console.log("stream-removed remote-uid: ", id);
});


//-------------------------->>>>> Video tutorial

// const handleFail = (e)=>{
//   console.log("Error",e);
// }
//
// const addVideoStream = (streamId) =>{
//   const streamDiv = document.createElement('div');
//   streamDiv.id = streamId;
//   streamDiv.style.transform = 'rotateY(180deg)';
//   remoteContainer.appendChild(streamDiv);
// }
//
// const removeStream = (event) => {
//   const stream = event.stream;
//   stream.stop();
//   const remDiv = document.getElementById(stream.getId());
//   remDiv.parentNode.removeChild(remDiv);
//   console.log('Remote stream is removed', stream.getId());
// }
//
// const addCanvas = (streamId) =>{
//   const video = document.getElementById(`video${streamId}`);
//   const canvas = document.createElement('canvas');
//   canvasContainer.appendChild(canvas);
//   const ctx = canvas.getContext('2d');
//   video.addEventListener('loadedmetadata', ()=>{
//     canvas.height = video.videoHeight;
//     canvas.width = video.videoWidth;
//   });
//   video.addEventListener('play', ()=>{
//     const self = this;
//     (function loop(){
//       if(!self.paused && !self.ended){
//         if(self.width !== canvas.width){
//           canvas.height = video.videoHeight;
//           canvas.width = video.videoWidth;
//         }
//         ctx.drawImage(self,0,0);
//         setTimeout(loop,1000/3); // 30fps
//       }
//     })();
//   }, 0);
// }
//
// const client = AgoraRTC.createClient({
//   mode: 'live',
//   codec: 'h264'
// })
// client.init('a45f6b67026048808a9418cf2f064254',()=> console.log('Client initialised'));
// client.join(null, 'demo', null,(userId)=>{
//   const localStream = AgoraTRC.createStream({
//     streamID: userId,
//     audio: false,
//     video:true,
//     screen:false
//   });
//   localStream.init(()=>{
//     localStream.play('me');
//     client.publish(localStream.handleFail);
//     client.on('stream-added',(event)=>{
//       client.subscribe(localStream.handleFail);
//     })
//     client.on('stream-subscribed', (event)=>{
//       const stream = event.stream;
//       addVideoStream(stream.getId());
//       stream.play(stream.getId());
//       addCanvas(stream.getId());
//       client.on('stream-removed',removeStream);
//     })
//   },handleFail);
// })

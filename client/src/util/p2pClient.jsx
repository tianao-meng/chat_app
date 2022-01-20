

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
class P2PConection {
  constructor(videoDispatch) {
    this.pc = null;
    this.stream = null;
    this.offer = null;
    this.answer = null;
    this.bufferedIce = [];
  }

  async setStream(){
      this.stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
  }

  initPc(onIceCandidate, gotRemoteStream){
    this.pc = new RTCPeerConnection({});
    this.pc.onicecandidate = onIceCandidate;
    this.pc.ontrack = gotRemoteStream; 
  }

  getStream(){
      console.log('in get stream');
      return this.stream;
  }

  createOffer = async () => {
    if(!this.stream){
        return;
    }
    this.stream.getTracks().forEach(track => this.pc.addTrack(track, this.stream));
    this.offer = await this.pc.createOffer(offerOptions);
    await this.pc.setLocalDescription(this.offer);
  }


  getOffer(){
      return this.offer;
  }

  closeVideo(){
    if (this.pc) {
        this.pc.close();

        this.pc = null;
    }
    if(this.stream){

        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
    }

  }

  createAnswer = async (sdp) => {
    await this.pc.setRemoteDescription(sdp);
    this.stream.getTracks().forEach(track => this.pc.addTrack(track, this.stream));
    this.answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(this.answer);
  }

  getAnswer(){
    return this.answer;
  }

  setRemoteSdp(sdp){
    this.pc.setRemoteDescription(sdp);
  }

  addIceCandidate(ice){
    this.pc.addIceCandidate(ice);
  }

  addBufferedIce(ice){
      this.bufferedIce.push(ice);
  }





}

export default P2PConection;
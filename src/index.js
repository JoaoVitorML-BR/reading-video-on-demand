import {createServer} from "node:http";
import {createReadStream} from "node:fs";
import {spawn} from "node:child_process";

createServer(async (req, res) => {
  const headers = {
    "Access-Control-ALlow-Origin": "*",
    "Access-Control-ALlow-Methods": "*"
  }

  if(req.method === "OPTIONS"){
    res.writeHead(204, headers);
    res.end();
    return;
  };

  res.writeHead(200, {
    "Content-Type": "video/mp4"
  });

  const ffmpegProcess = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-f',  'mp4',
    '-vcodec',  'h264',
    '-acodec',  'aac',
    '-movflags',  'frag_keyframe+empty_moov+default_base_moof',
    '-b:v',  '1500k',
    '-maxrate',  '1500k',
    '-bufsize',  '1000k',
    '-f',  'mp4',
    '-vf', "monochrome,drawtext=text='João Vitor':x=10:y=H-th-10:fontsize=50:fontcolor=yellow:shadowcolor=black:shadowx=5:shadowy=5",
    'pipe:1'
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  createReadStream("./assets/video.mp4").pipe(ffmpegProcess.stdin);

  ffmpegProcess.stderr.on('data', msg => console.log(msg.toString()));
  ffmpegProcess.stdout.pipe(res);

  req.once("close", () => {
    ffmpegProcess.stdout.destroy();
    ffmpegProcess.stdin.destroy();
    console.log('disconnected!', ffmpegProcess.kill());
  });

}).listen(1952, () => console.log("Servidor rodando na porta:3000"));
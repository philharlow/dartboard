import { useConnectionStore } from "./store/ConnectionStore";

let reader: ReadableStreamDefaultReader<string> | undefined;
let outputStream: WritableStream<string> | undefined;

export const connectSerial = async () => {
  const ports = await navigator.serial.getPorts();

  const port = ports[0];// await navigator.serial.requestPort();
  console.log("ports", ports);
  console.log("port !== undefined", port !== undefined);
  if (port !== undefined) {

    const { setSerialConnected } = useConnectionStore.getState();
    setSerialConnected(true);
    console.log("port 2");
    await port.open({ baudRate: 9600 });

    if (port.readable) {
      let decoder = new TextDecoderStream();
      //await port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;

      reader = inputStream.getReader();
      readLoop();
    }

    if (port.writable) {
      const encoder = new TextEncoderStream();
      //await encoder.readable.pipeTo(port.writable);
      outputStream = encoder.writable;
    }
    

  }
  //const ports = await SerialPort.list();
  //console.log("ports", ports);
  /*

  serialport = new SerialPort({ path: '/dev/example', baudRate: 9600 })
  serialport.write('ROBOT POWER ON')


  const parser = serialport.pipe(new ReadlineParser())
  parser.on('data', console.log)

  serialport.on('open', () => {
    serialport.write('data')
  });
  */
};

export const writeToSerial = (lines: string[]) => {
  if (outputStream) {
    const writer = outputStream.getWriter();
    lines.forEach((line) => {
      console.log('[SEND]', line);
      writer.write(line + '\n');
    });
    writer.releaseLock();
  }
}

const readLoop = async () => {
  while (reader) {
    const { value, done } = await reader.read();
    if (value) {
      console.log("serial got:", value);
      //log.textContent += value + '\n';
    }
    if (done) {
      console.log('[readLoop] DONE', done);
      reader.releaseLock();
      break;
    }
  }
}
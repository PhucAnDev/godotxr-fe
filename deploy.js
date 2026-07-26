import { Client } from 'ssh2';
import process from 'process';

const conn = new Client();
const cmd = process.argv.slice(2).join(' ') || 'pwd; ls -la; ps aux | grep dotnet';

conn.on('ready', () => {
  console.log('SSH Connection Successful');
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code, signal) => {
      console.log(`Command finished with exit code ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
}).connect({
  host: '103.162.30.111',
  port: 26266,
  username: 'root',
  password: '^#^09Y_p-',
  readyTimeout: 30006
});

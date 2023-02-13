import { createCipheriv, createDecipheriv, createECDH, createHash, randomBytes } from 'crypto';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import { CipherAlgorithm } from './Constants';
import EventEmitter from 'eventemitter3';
import TCP from 'react-native-tcp-socket';
import { TCPClient } from './TCPClient';
import { sleep } from '../../utils/async';

const { createServer, Server } = TCP;

export abstract class TCPServer<T extends EventEmitter.ValidEventTypes> extends EventEmitter<T, any> {
  private readonly server: TCP.Server;
  private static port = 39127;

  constructor() {
    super();
    this.server = new Server(this.handleClient);
  }

  get port() {
    return this.server.address()?.port;
  }

  get address() {
    return this.server.address()?.address;
  }

  async start() {
    if (this.server.listening) return true;
    let attempts = 0;

    while (attempts < 3) {
      try {
        await new Promise<void>((resolve) => this.server.listen({ port: TCPServer.port++, host: '0.0.0.0' }, () => resolve()));
        break;
      } catch (error) {
        console.log(error, TCPServer.port);
        attempts++;
      }
    }

    return attempts < 3;
  }

  stop() {
    return new Promise<void>((resolve) => {
      this.server.close((err) => {
        console.log('close err:', err);
        resolve();
      });
    });
  }

  private handleClient = async (c: TCP.Socket | TCP.TLSSocket) => {
    const socket = new AsyncTCPSocket(c);
    const client = await this.handshake(socket);

    if (client) {
      while (!client.greeted) {
        await sleep(500);
      }

      console.log('new client', socket.remoteId, client.greeted);
      this.newClient(client);
    } else {
      socket.destroy();
      return;
    }
  };

  private handshake = async (socket: AsyncTCPSocket): Promise<TCPClient | undefined> => {
    try {
      const iv = randomBytes(16);
      const ecdh = createECDH('secp256k1');

      await socket.write(Buffer.from([...iv, ...ecdh.generateKeys()]));
      const negotiation = await socket.read();

      const civ = negotiation.subarray(0, 16);
      const negotiationKey = negotiation.subarray(16);

      const secret = ecdh.computeSecret(negotiationKey);
      const verificationCode = `${secret.reduce((p, c) => p * BigInt(c || 1), 1n)}`.substring(6, 10);

      const cipher = createCipheriv(CipherAlgorithm, createHash('sha256').update(secret).digest(), iv);
      const decipher = createDecipheriv(CipherAlgorithm, secret, civ);

      console.log('server computes:', secret.toString('hex'), verificationCode);

      return new TCPClient({ cipher, decipher, socket: socket.raw, verificationCode });
    } catch (error) {
      console.error(error);
    }
  };

  protected abstract newClient(_: TCPClient): void;
}

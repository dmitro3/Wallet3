import * as Linking from 'expo-linking';

import { Bytes, providers, utils } from 'ethers';

import App from '../App';
import Database from '../../models/Database';
import EventEmitter from 'events';
import InpageDApp from '../../models/InpageDApp';
import Networks from '../Networks';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { WCCallRequest_eth_sendTransaction } from '../../models/WCSession_v1';
import { hashPersonalMessage } from 'ethereumjs-util';
import { rawCall } from '../../common/RPC';

interface Payload {
  id?: string;
  jsonrpc?: string;
  method: string;
  params: any[] | any;
  __mmID: string;
  hostname?: string;

  pageMetadata?: { icon: string; title: string; desc?: string };
}

interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

export interface ConnectInpageDApp extends Payload {
  origin: string;
  approve: () => void;
  reject: () => void;
}

export interface InpageDAppSignRequest {
  type: 'plaintext' | 'typedData';
  chainId: number;
  msg?: string;
  typedData?: any;
  approve: (pin?: string) => Promise<boolean>;
  reject: () => void;
}

export interface InpageDAppTxRequest {
  chainId: number;
  param: WCCallRequest_eth_sendTransaction;
  account: string;
  app: { name: string; icon: string };
  approve: (obj: { pin?: string; tx: providers.TransactionRequest }) => Promise<boolean>;
  reject: () => void;
}

export interface InpageDAppAddEthereumChain {
  approve: () => void;
  reject: () => void;
  chain: AddEthereumChainParameter;
}

class InpageDAppHub extends EventEmitter {
  apps = new Map<string, InpageDApp>();

  get inpageDApps() {
    return Database.inpageDApps;
  }

  async handle(origin: string, payload: Payload) {
    const { method, params, __mmID, id, jsonrpc } = payload;
    let response: any = null;

    switch (method) {
      case 'eth_accounts':
        const account = (await this.getDApp(origin))?.lastUsedAccount;
        response = account ? [account] : [];
        break;
      case 'eth_requestAccounts':
        response = await this.eth_requestAccounts(origin, payload);
        break;
      case 'net_version':
      case 'eth_chainId':
        response = `0x${Number(this.apps.get(origin)?.lastUsedChainId ?? Networks.current.chainId).toString(16)}`;
        break;
      case 'wallet_switchEthereumChain':
        response = await this.wallet_switchEthereumChain(origin, params);
        break;
      case 'personal_sign':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        response = await this.sign(origin, params, method);
        break;
      case 'eth_sign':
        response = { error: { message: 'eth_sign is not supported' } };
        break;
      case 'eth_sendTransaction':
        response = await this.eth_sendTransaction(origin, payload);
        break;
      case 'wallet_addEthereumChain':
        response = await this.wallet_addEthereumChain(origin, params);
        break;
      case 'eth_getEncryptionPublicKey':
      case 'eth_decrypt':
        break;
      default:
        const dapp = await this.getDApp(origin);
        if (dapp) response = await rawCall(dapp.lastUsedChainId, { method, params });
        break;
    }

    // delete (params || {})[0]?.data;
    // console.log(
    //   origin,
    //   __mmID,
    //   method,
    //   // response,
    //   // JSON.stringify(params || {}).substring(0, 200),
    //   JSON.stringify(response || null).substring(0, 64)
    // );
    // console.log(payload);

    // if (response === null) console.log('null resp', hostname, this.apps.has(hostname ?? ''), origin);

    return JSON.stringify({ type: 'INPAGE_RESPONSE', payload: { id, jsonrpc, __mmID, error: undefined, response } });
  }

  private async getDApp(origin: string) {
    return this.apps.get(origin) || (await this.inpageDApps.findOne({ where: { origin } }));
  }

  private async eth_requestAccounts(origin: string, payload: Payload) {
    if (!App.currentWallet) return [];

    const dapp = await this.getDApp(origin);
    if (dapp) {
      this.apps.set(origin, dapp);
      const account = App.allAccounts.find((a) => a.address === dapp.lastUsedAccount); // Ensure last used account is still available
      return [account?.address ?? App.allAccounts[0].address];
    }

    return new Promise<string[] | any>((resolve) => {
      const approve = () => {
        const account = App.currentWallet?.currentAccount?.address!;
        const app = new InpageDApp();
        app.origin = origin;
        app.lastUsedAccount = account;
        app.lastUsedChainId = `0x${Number(Networks.current.chainId).toString(16)}`;
        this.apps.set(origin, app);
        resolve([account]);
      };

      const reject = () => resolve({ error: { code: 4001, message: 'User rejected' } });
      PubSub.publish('openConnectInpageDApp', { approve, reject, origin, ...payload } as ConnectInpageDApp);
    });
  }

  private async wallet_switchEthereumChain(origin: string, params: { chainId: string }[]) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return null;

    const targetChainId = params[0].chainId;
    if (!Networks.has(targetChainId)) return { error: { code: 4092, message: 'the chain has not been added to Wallet 3' } };

    dapp.lastUsedChainId = targetChainId;

    this.emit('appStateUpdated', {
      type: 'STATE_UPDATE',
      payload: { origin, selectedAddress: dapp.lastUsedAccount, network: targetChainId },
    });

    return null;
  }

  private async sign(origin: string, params: string[], method: string) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return;

    return new Promise((resolve) => {
      let msg: string | undefined = undefined;
      let typedData: any;
      let type: 'plaintext' | 'typedData' = 'plaintext';
      let typedVersion = SignTypedDataVersion.V4;

      const approve = async (pin?: string) => {
        const { wallet, accountIndex } = App.findWallet(dapp.lastUsedAccount) || {};
        if (!wallet) return resolve({ error: { code: 4001, message: 'Invalid account' } });

        const signed =
          type === 'typedData'
            ? await wallet.signTypedData({ typedData, pin, accountIndex, version: typedVersion })
            : await wallet.signMessage({ msg: msg!, pin, accountIndex });

        if (signed) resolve(signed);

        return signed ? true : false;
      };

      const reject = () => resolve({ error: { code: 1, message: 'User rejected' } });

      switch (method) {
        case 'personal_sign':
          msg = Buffer.from(utils.arrayify(params[0])).toString('utf8');
          type = 'plaintext';
          break;
        case 'eth_signTypedData_v3':
          typedData = JSON.parse(params[1]);
          type = 'typedData';
          typedVersion = SignTypedDataVersion.V3;
          break;
        case 'eth_signTypedData_v4':
          typedData = JSON.parse(params[1]);
          type = 'typedData';
          typedVersion = SignTypedDataVersion.V4;
          break;
      }

      PubSub.publish('openInpageDAppSign', {
        msg,
        typedData,
        type,
        approve,
        reject,
        chainId: Number(dapp.lastUsedChainId),
      } as InpageDAppSignRequest);
    });
  }

  private async eth_sendTransaction(origin: string, payload: Payload) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return null;

    const { params, pageMetadata } = payload;

    return new Promise<string | any>((resolve) => {
      const approve = async ({ pin, tx }: { pin?: string; tx: providers.TransactionRequest }) => {
        const { wallet, accountIndex } = App.findWallet(dapp.lastUsedAccount) || {};
        if (!wallet) return resolve({ error: { code: 4001, message: 'Invalid account' } });

        const { txHex, error } = await wallet.signTx({
          tx,
          pin,
          accountIndex: accountIndex!,
        });

        if (!txHex) return false;

        const hash = await wallet.sendTx({
          txHex,
          tx,
          readableInfo: { dapp: pageMetadata?.title ?? '', type: 'dapp-interaction', icon: pageMetadata?.icon },
        });

        resolve(hash);

        return hash ? true : false;
      };

      const reject = () => resolve({ error: { code: 1, message: 'User rejected' } });

      PubSub.publish('openInpageDAppSendTransaction', {
        approve,
        reject,
        param: params[0] as WCCallRequest_eth_sendTransaction,
        chainId: Number(dapp.lastUsedChainId),
        account: dapp.lastUsedAccount,
        app: { name: pageMetadata!.title, icon: pageMetadata!.icon },
      } as InpageDAppTxRequest);
    });
  }

  private async wallet_addEthereumChain(origin: string, params: AddEthereumChainParameter[]) {
    if (!params || !params.length) return { error: { message: 'Invalid request' } };

    const chain = params[0];
    if (Networks.has(chain?.chainId)) return null;

    if (!Array.isArray(chain.rpcUrls) || !Array.isArray(chain.blockExplorerUrls) || !chain.nativeCurrency)
      return { error: { message: 'Invalid request' } };

    return new Promise((resolve) => {
      const approve = () => {
        resolve(null);
        this.wallet_switchEthereumChain(origin, [{ chainId: params[0].chainId }]);
      };

      const reject = () => {
        resolve({ error: { code: 1, message: 'User rejected' } });
      };

      PubSub.publish('openAddEthereumChain', {
        approve,
        reject,
        chain: params[0],
      } as InpageDAppAddEthereumChain);
    });
  }
}

export default new InpageDAppHub();

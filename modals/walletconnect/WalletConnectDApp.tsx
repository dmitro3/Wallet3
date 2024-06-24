import { Button, SafeViewContainer } from '../../components';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { AccountBase } from '../../viewmodels/account/AccountBase';
import AccountSelector from '../dapp/AccountSelector';
import App from '../../viewmodels/core/App';
import DAppConnectView from '../dapp/DAppConnectView';
import { INetwork } from '../../common/Networks';
import IllustrationCancel from '../../assets/illustrations/misc/cancel.svg';
import Loading from '../views/Loading';
import NetworkSelector from '../dapp/NetworkSelector';
import Networks from '../../viewmodels/core/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import WalletConnectHub from '../../viewmodels/walletconnect/WalletConnectHub';
import { WalletConnect_v1 } from '../../viewmodels/walletconnect/WalletConnect_v1';
import { WalletConnect_v2 } from '../../viewmodels/walletconnect/WalletConnect_v2';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface DAppProps {
  client: WalletConnect_v1 | WalletConnect_v2;
  onNetworksPress?: () => void;
  onAccountsPress?: () => void;
  close: Function;
  onConnect: () => void;

  network: INetwork;
  account?: AccountBase;
}

const DApp = observer(({ client, onNetworksPress, onAccountsPress, close, onConnect, account, network }: DAppProps) => {
  const { t } = i18n;

  const app = client.appMeta!;

  if (!app) return null;

  const reject = async () => {
    close();
    client.rejectSession();
    client.killSession();
    client.dispose();
  };

  if (!network) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: 'crimson', fontSize: 24 }}>{t('modal-dapp-not-supported-network')}</Text>
        </View>
        <Button title="Close" onPress={() => close()} />
      </View>
    );
  }

  return (
    <DAppConnectView
      network={network}
      account={account}
      appDesc={app.description}
      appIcon={app.icons[0]}
      appName={app.name}
      appUrl={app.url}
      disableNetworksButton={client.version > 1}
      onAccountsPress={onAccountsPress}
      onNetworksPress={onNetworksPress}
      onConnect={onConnect}
      onReject={reject}
      themeColor={network.color}
    />
  );
});

interface ConnectDAppProps {
  client: WalletConnect_v1 | WalletConnect_v2;
  close: Function;
  extra?: { fromMobile?: boolean; hostname?: string };
}

const ConnectDApp = observer(({ client, close }: ConnectDAppProps) => {
  const swiper = useRef<Swiper>(null);
  const [panel, setPanel] = useState(1);
  const [account, setAccount] = useState(client.activeAccount);
  const [network, setNetwork] = useState(client.activeNetwork);

  const selectNetworks = (chains: number[]) => {
    swiper.current?.scrollTo(0);
    client.setLastUsedChain(chains[0]);
    setNetwork(client.activeNetwork);
  };

  const selectAccounts = (accounts: string[]) => {
    swiper.current?.scrollTo(0);
    client.setLastUsedAccount(accounts[0]);
    setAccount(client.activeAccount);
  };

  const connect = () => {
    client.approveSession();
    close();
  };

  const swipeTo = (index: number) => {
    setPanel(index);
    setTimeout(() => swiper.current?.scrollTo(1), 25);
  };

  return (
    <Swiper
      ref={swiper}
      showsPagination={false}
      showsButtons={false}
      scrollEnabled={false}
      loop={false}
      automaticallyAdjustContentInsets
    >
      <DApp
        client={client}
        close={close}
        onNetworksPress={() => swipeTo(1)}
        onAccountsPress={() => swipeTo(2)}
        onConnect={connect}
        account={account}
        network={network}
      />

      {panel === 1 ? (
        <NetworkSelector single networks={Networks.all} selectedChains={client.chains} onDone={selectNetworks} />
      ) : undefined}

      {panel === 2 ? (
        <AccountSelector
          single
          accounts={App.allAccounts}
          selectedAccounts={client.accounts}
          onDone={selectAccounts}
          network={network}
        />
      ) : undefined}
    </Swiper>
  );
});

const TimeoutView = ({ close, msg }: { close: Function; msg?: string }) => {
  const { t } = i18n;

  return (
    <SafeViewContainer style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flex: 1 }} />
        <IllustrationCancel width={125} height={125} />
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: 24, color: 'crimson', marginTop: 24 }}>{msg ?? t('modal-dapp-connection-timeout')}</Text>
        <Text style={{ fontSize: 17, color: 'crimson', marginTop: 12 }}>{t('modal-dapp-connection-refresh-again')}</Text>
        <View style={{ flex: 1 }} />
      </View>
      <Button title="Close" onPress={() => close()} />
    </SafeViewContainer>
  );
};

interface Props {
  uri?: string;
  directClient?: WalletConnect_v2;
  extra?: { fromMobile?: boolean; hostname?: string };
  close: Function;
}

export default observer(({ uri, close, extra, directClient }: Props) => {
  const [connecting, setConnecting] = useState(directClient ? false : true);
  const [connectTimeout, setConnectTimeout] = useState(false);
  const [client, setClient] = useState<WalletConnect_v1 | WalletConnect_v2 | undefined>(directClient);
  const [errorMsg, setErrorMsg] = useState<string>();

  const { t } = i18n;

  useEffect(() => {
    if (!uri) return;
    if (client) return;

    WalletConnectHub.connect(uri, extra)
      .then((wc_client) => {
        if (!wc_client) {
          setErrorMsg(t('modal-dapp-connection-wc-failed'));
          setConnectTimeout(true);
          return;
        }

        const timeout = setTimeout(async () => {
          setConnectTimeout(true);
          setConnecting(false);
          setClient(undefined);
          await wc_client?.killSession();
          wc_client?.dispose();
          wc_client = undefined;
        }, 15 * 1000);

        wc_client?.once('sessionRequest', () => {
          clearTimeout(timeout);
          setConnecting(false);
          setClient(wc_client!);
        });
      })
      .catch(() => setConnectTimeout(true));
  }, [uri]);

  return (
    <SafeAreaProvider style={styles.safeArea}>
      {connecting && !connectTimeout ? <Loading /> : undefined}
      {client ? <ConnectDApp client={client} close={close} extra={extra} /> : undefined}
      {connectTimeout ? <TimeoutView close={close} msg={errorMsg} /> : undefined}
    </SafeAreaProvider>
  );
});

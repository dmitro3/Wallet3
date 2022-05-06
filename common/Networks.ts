import {
  AVAXPopularTokens,
  ArbiPopularTokens,
  AuroraPopularTokens,
  BobaPopularTokens,
  BscPopularTokens,
  CeloPopularTokens,
  EthereumPopularTokens,
  FTMPopularTokens,
  HarmonyDefaultToken,
  HecoPopularTokens,
  IToken,
  MetisPopularTokens,
  MoonriverDefaultToken,
  OpPopularTokens,
  PolygonPopularTokens,
  RoninPopularTokens,
  xDaiPopularTokens,
  zkSyncFeeTokens,
  zkSyncPopularTokens,
} from './tokens';

export interface INetwork {
  comm_id: string;
  symbol: string;
  network: string;
  chainId: number;
  color: string;
  test?: boolean;
  l2?: boolean;
  eip1559?: boolean;
  order?: number;
  defaultTokens: IToken[];
  showOverview?: boolean;
  blockTimeMs?: number;
  explorer: string;
  etherscanApi?: string;
  rpcUrls?: string[];
  addrPrefix?: string;
  github_dir?: string;
  isUserAdded?: boolean;
  feeTokens?: IToken[];
}

export const PublicNetworks: INetwork[] = [
  {
    symbol: 'ETH',
    comm_id: 'eth',
    network: 'Ethereum',
    chainId: 1,
    color: '#6186ff',
    eip1559: true,
    order: 1,
    defaultTokens: EthereumPopularTokens,
    blockTimeMs: 12 * 1000,
    explorer: 'https://etherscan.io',
    etherscanApi: 'https://api.etherscan.io/api',
  },
  {
    symbol: 'ETH',
    comm_id: 'arb',
    network: 'Arbitrum One',
    chainId: 42161,
    color: '#28a0f0',
    order: 3,
    l2: true,
    defaultTokens: ArbiPopularTokens,
    showOverview: false,
    explorer: 'https://arbiscan.io',
    etherscanApi: 'https://api.arbiscan.io/api',
    github_dir: 'arbitrum',
  },
  {
    symbol: 'ETH',
    comm_id: 'op',
    network: 'Optimism',
    chainId: 10,
    color: '#FF0420',
    order: 3,
    l2: true,
    defaultTokens: OpPopularTokens,
    showOverview: false,
    explorer: 'https://optimistic.etherscan.io',
    etherscanApi: 'https://api-optimistic.etherscan.io/api',
  },
  {
    symbol: 'ETH',
    comm_id: 'boba',
    network: 'Boba',
    chainId: 288,
    color: '#9ce012',
    l2: true,
    defaultTokens: BobaPopularTokens,
    explorer: 'https://blockexplorer.boba.network',
    etherscanApi: 'https://blockexplorer.boba.network/api',
  },
  {
    symbol: 'MATIC',
    comm_id: 'matic',
    network: 'Polygon',
    chainId: 137,
    color: '#8247E5',
    order: 2,
    eip1559: true,
    defaultTokens: PolygonPopularTokens,
    blockTimeMs: 3 * 1000,
    explorer: 'https://polygonscan.com',
    etherscanApi: 'https://api.polygonscan.com/api',
  },
  {
    symbol: 'BNB',
    comm_id: 'bsc',
    network: 'BNB Chain',
    chainId: 56,
    color: '#f3ba2f',
    order: 5,
    defaultTokens: BscPopularTokens,
    blockTimeMs: 5 * 1000,
    explorer: 'https://bscscan.com',
    etherscanApi: 'https://api.bscscan.com/api',
    github_dir: 'smartchain',
  },
  {
    symbol: 'ETH',
    comm_id: 'aurora',
    chainId: 1313161554,
    network: 'Aurora',
    color: '#70d44b',
    defaultTokens: AuroraPopularTokens,
    explorer: 'https://aurorascan.dev',
    etherscanApi: 'https://api.aurorascan.dev/api',
  },
  {
    symbol: 'xDAI',
    comm_id: 'xdai',
    network: 'Gnosis Chain',
    chainId: 100,
    color: '#48A9A6',
    order: 3,
    defaultTokens: xDaiPopularTokens,
    blockTimeMs: 5 * 1000,
    explorer: 'https://blockscout.com/xdai/mainnet',
    etherscanApi: 'https://blockscout.com/xdai/mainnet/api',
    eip1559: true,
    github_dir: 'xdai',
  },
  {
    symbol: 'CELO',
    comm_id: 'celo',
    chainId: 42220,
    network: 'Celo',
    color: '#35D07F',
    order: 6,
    defaultTokens: CeloPopularTokens,
    blockTimeMs: 5 * 1000,
    explorer: 'https://explorer.celo.org',
    etherscanApi: 'https://explorer.celo.org/api',
  },
  {
    symbol: 'ONE',
    comm_id: 'hmy',
    network: 'Harmony',
    chainId: 1666600000,
    explorer: 'https://explorer.harmony.one',
    color: '#00aee9',
    defaultTokens: HarmonyDefaultToken,
  },
  {
    symbol: 'Metis',
    comm_id: 'metis',
    network: 'Metis',
    chainId: 1088,
    color: '#00DACC',
    defaultTokens: MetisPopularTokens,
    explorer: 'https://andromeda-explorer.metis.io',
    etherscanApi: 'https://andromeda-explorer.metis.io/api',
  },
  {
    symbol: 'RON',
    comm_id: 'ron',
    chainId: 2020,
    network: 'Ronin',
    color: '#1273EA',
    defaultTokens: RoninPopularTokens,
    explorer: 'https://explorer.roninchain.com',
    addrPrefix: 'ronin:',
  },
  {
    symbol: 'FTM',
    comm_id: 'ftm',
    chainId: 250,
    network: 'Fantom',
    color: '#13b5ec',
    order: 4,
    defaultTokens: FTMPopularTokens,
    blockTimeMs: 10 * 1000,
    explorer: 'https://ftmscan.com',
    etherscanApi: 'https://api.ftmscan.com/api',
  },
  {
    symbol: 'EVMOS',
    comm_id: 'evmos',
    chainId: 9001,
    network: 'Evmos',
    color: '#ED4E33',
    defaultTokens: [],
    explorer: 'https://evm.evmos.org',
    etherscanApi: 'https://evm.evmos.org/api',
  },
  {
    symbol: 'MOVR',
    comm_id: 'movr',
    chainId: 1285,
    network: 'Moonriver',
    color: '#53cbc9',
    defaultTokens: MoonriverDefaultToken,
    explorer: 'https://moonriver.moonscan.io',
    etherscanApi: 'https://api-moonriver.moonscan.io/api',
  },
  {
    symbol: 'GLMR',
    comm_id: 'mobm',
    chainId: 1284,
    network: 'Moonbeam',
    color: '#53cbc9',
    defaultTokens: [],
    explorer: 'https://moonbeam.moonscan.io',
    etherscanApi: 'https://api-moonbeam.moonscan.io/api',
  },
  {
    symbol: 'AVAX',
    comm_id: 'avax',
    chainId: 43114,
    network: 'Avalanche',
    color: '#E84142',
    order: 5,
    eip1559: true,
    defaultTokens: AVAXPopularTokens,
    blockTimeMs: 5 * 1000,
    explorer: 'https://snowtrace.io',
    etherscanApi: 'https://api.snowtrace.io/api',
    github_dir: 'avalanchec',
  },
  {
    symbol: 'ASTR',
    comm_id: 'astr',
    network: 'Astar',
    chainId: 592,
    explorer: 'https://blockscout.com/astar',
    etherscanApi: 'https://blockscout.com/astar/api',
    color: '#00aee9',
    defaultTokens: [],
  },
  {
    symbol: 'SDN',
    comm_id: 'sdn',
    network: 'Shiden',
    chainId: 336,
    explorer: 'https://shiden.subscan.io',
    color: '#5928b1',
    defaultTokens: [],
  },
  {
    symbol: 'KLAY',
    chainId: 8217,
    comm_id: 'klay',
    network: 'Klaytn',
    color: '#de6b8f',
    defaultTokens: [],
    explorer: 'https://scope.klaytn.com',
  },
  {
    symbol: 'FRA',
    comm_id: 'fra',
    network: 'Findora',
    chainId: 2152,
    explorer: 'https://evm.findorascan.io',
    color: '#7733FF',
    defaultTokens: [],
  },
  {
    symbol: 'FUSE',
    comm_id: 'fuse',
    chainId: 122,
    network: 'Fuse',
    color: '#58ed67',
    defaultTokens: [],
    explorer: 'https://explorer.fuse.io',
    etherscanApi: 'https://explorer.fuse.io/api',
  },
  {
    symbol: 'HT',
    comm_id: 'heco',
    chainId: 128,
    network: 'Heco',
    order: 6,
    color: '#3F7FFF',
    defaultTokens: HecoPopularTokens,
    blockTimeMs: 5 * 1000,
    explorer: 'https://hecoinfo.com',
    etherscanApi: 'https://api.hecoinfo.com/api',
  },
  {
    symbol: 'OKB',
    comm_id: 'okt',
    chainId: 66,
    network: 'OEC',
    order: 7,
    color: '#24c',
    defaultTokens: [],
    blockTimeMs: 5 * 1000,
    explorer: 'https://www.oklink.com/okexchain',
  },
  {
    symbol: 'CRO',
    comm_id: 'cro',
    network: 'Cronos',
    chainId: 25,
    explorer: 'https://cronos.org/explorer',
    etherscanApi: 'https://cronos.org/explorer/api',
    color: '#474169',
    defaultTokens: [],
  },
];

export const Testnets: INetwork[] = [
  {
    comm_id: '',
    symbol: 'ETH',
    network: 'Ropsten',
    chainId: 3,
    color: '#6186ff',
    test: true,
    eip1559: true,
    defaultTokens: [],
    explorer: 'https://ropsten.etherscan.io',
  },
  {
    comm_id: '',
    symbol: 'ETH',
    network: 'Rinkeby',
    chainId: 4,
    color: '#6186ff',
    test: true,
    eip1559: true,
    defaultTokens: [],
    explorer: 'https://rinkeby.etherscan.io',
  },
  {
    comm_id: '',
    symbol: 'ETH',
    network: 'Goerli',
    chainId: 5,
    color: '#6186ff',
    eip1559: true,
    test: true,
    defaultTokens: [],
    explorer: 'https://goerli.etherscan.io',
  },
  {
    comm_id: '',
    symbol: 'ETH',
    network: 'Kovan',
    chainId: 42,
    color: '#6186ff',
    test: true,
    defaultTokens: [],
    explorer: 'https://kovan.etherscan.io',
  },
  {
    comm_id: '',
    symbol: 'ETH',
    network: 'zkSync 2.0 Testnet Goerli',
    chainId: 280,
    color: '#8C8DFC',
    test: true,
    defaultTokens: zkSyncPopularTokens,
    explorer: 'https://zksync2-testnet.zkscan.io',
    feeTokens: zkSyncFeeTokens,
  },
  {
    comm_id: '',
    symbol: 'MATIC',
    network: 'Mumbai Testnet',
    chainId: 80001,
    color: '#8247E5',
    test: true,
    defaultTokens: [],
    explorer: 'https://polygonscan.com/',
  },
];

export const AllNetworks: INetwork[] = [...PublicNetworks, ...Testnets];

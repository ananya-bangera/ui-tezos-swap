'use client';
import React, { useEffect, useState } from 'react';
import { ArrowsRightLeftIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import tokenListData from './output.json';
import TradingViewWidget from './components/TradingView';
import { createConfig } from 'wagmi';
import { useAccount, useDisconnect } from "wagmi";

const chainNames: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  56: 'BNB Chain',
  130: 'xDai',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum',
  43114: 'Avalanche',
};

type Token = typeof tokenListData.tokens[number];
type ChainToken = {
  name: string;
  symbol: string;
  logoURI: string;
  chainId: number;
  chain: string;
  tokenAddress: string;
};

export default function SwapPage() {

  const { address: connectedAddress } = useAccount();
  const connectedWalletAddress = connectedAddress;

  const [allTokens] = useState<Token[]>(tokenListData.tokens);
  const tokenSymbols = Array.from(new Set(allTokens.map(t => t.symbol))).sort();

  // Symbol state
  const [srcTokenSymbol, setSrcTokenSymbol] = useState(tokenSymbols[0]);
  const [dstTokenSymbol, setDstTokenSymbol] = useState(tokenSymbols[1] || tokenSymbols[0]);

  // Options & selection state
  const [srcOptions, setSrcOptions] = useState<ChainToken[]>([]);
  const [dstOptions, setDstOptions] = useState<ChainToken[]>([]);
  const [src, setSrc] = useState<ChainToken | null>(null);
  const [dst, setDst] = useState<ChainToken | null>(null);

  // Amounts
  const [srcAmount, setSrcAmount] = useState('');
  const [dstAmount, setDstAmount] = useState('');
  const [time, setTime] = useState('');
  const [destinationMakerAddress, setDestinationMakerAddress] = useState('');

  // Build option lists when a symbol changes
  useEffect(() => {
    const token = allTokens.find(t => t.symbol === srcTokenSymbol);
    if (!token) return;
    const list: ChainToken[] = [{
      name: token.name, symbol: token.symbol, logoURI: token.logoURI,
      chainId: token.chainId, chain: chainNames[token.chainId] || String(token.chainId),
      tokenAddress: token.address,
    }];
    for (const [id, val] of Object.entries(token.extensions?.bridgeInfo || {})) {
      const cid = Number(id);
      list.push({
        name: token.name, symbol: token.symbol, logoURI: token.logoURI,
        chainId: cid, chain: chainNames[cid] || String(cid),
        tokenAddress: val.tokenAddress,
      });
    }
    setSrcOptions(list);
    setSrc(list[0]);
  }, [srcTokenSymbol, allTokens]);

  useEffect(() => {
    const token = allTokens.find(t => t.symbol === dstTokenSymbol);
    if (!token) return;
    const list: ChainToken[] = [{
      name: token.name, symbol: token.symbol, logoURI: token.logoURI,
      chainId: token.chainId, chain: chainNames[token.chainId] || String(token.chainId),
      tokenAddress: token.address,
    }];
    for (const [id, val] of Object.entries(token.extensions?.bridgeInfo || {})) {
      const cid = Number(id);
      list.push({
        name: token.name, symbol: token.symbol, logoURI: token.logoURI,
        chainId: cid, chain: chainNames[cid] || String(cid),
        tokenAddress: val.tokenAddress,
      });
    }
    setDstOptions(list);
    setDst(list[0]);
  }, [dstTokenSymbol, allTokens]);

  const [contractLogs, setContractLogs] = useState<any[]>([]);

  // Swap the two panels
  const handleSwap = () => {
    const tmpSym = srcTokenSymbol, tmpOpts = srcOptions, tmpSel = src, tmpAmt = srcAmount;
    setSrcTokenSymbol(dstTokenSymbol);
    setSrcOptions(dstOptions);
    setSrc(dst);
    setSrcAmount(dstAmount);

    setDstTokenSymbol(tmpSym);
    setDstOptions(tmpOpts);
    setDst(tmpSel);
    setDstAmount(tmpAmt);
  };

  // const createOrder = async () => {
  //   // Placeholder for order creation logic
  //   setContractLogs(prev => [...prev, `Creating order: ${srcAmount} ${src?.symbol} -> ${dstAmount} ${dst?.symbol} Time: ${time} minutes ... `]);

  //   setContractLogs(prev => [...prev, `Generating secret for order...`]);

  //   // Placeholder for secret generation logic

  //   //secret generate a random order ID (sha256 hash of a random <number></number>)
  //   const randomNum = Math.floor(Math.random() * 1e18).toString();
  //   const encoder = new TextEncoder();
  //   const data = encoder.encode(randomNum);
  //   // Use SubtleCrypto for SHA-256 hash
  //   await window.crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
  //     const hashArray = Array.from(new Uint8Array(hashBuffer));
  //     const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  //     setContractLogs(prev => [...prev, `Generated secret (sha256): ${hashHex}`]);
  //     // You can use hashHex as the order ID
  //   });

  //   setContractLogs(prev => [...prev, `Connected wallet address: ${connectedWalletAddress}`]);

  //   // Placeholder for API call to create order
  //   setContractLogs(prev => [...prev, `Creating order on relayer...`]);
  //   //{
  //   //     "name": "1inch",
  //   //     "symbol": "1INCH",
  //   //     "logoURI": "https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028",
  //   //     "chainId": 1,
  //   //     "chain": "Ethereum",
  //   //     "tokenAddress": "0x111111111117dC0aa78b770fA6A738034120C302"
  //   // }
  //   // console.log(dst)


  //   /// tezos api ko call (create order relayer)
  //   // api - https://tezos-apis.vercel.app/fusion-plus/relayer/v1.0/submit
  //   // method - POST
  //   // body -   {
  //   //     "status": "ACTIVE",
  //   //   "makerDestinationChainAddress": "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb" - destinationMakerAddress
  //   //   "makerSourceChainAddress": "0x1234567890abcdef1234567890abcdef12345678" - connectedWalletAddress,
  //   //   "srcChain": "Polygon" src.chain,
  //   //   "destinationChain": "Tezos" dst.chain,
  //   //   "timelock": 1753618932 - ask sarv,
  //   //   "hashlock": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef" hash(secret),
  //   //   "srcTokenAddress": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", //src.tokenAddress
  //   //   "dstTokenAddress": "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton", - dst.tokenAddress
  //   //   "srcQty": 100, // srcAmount
  //   //   "dstQty": 2,  dstAmount
  //   //   "orderHash": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" - not mandatory, can be empty
  //   // }


  // }
  const addLog = async (msg: string) => {
    setContractLogs(prev => [...prev, msg]);
    await new Promise(res => setTimeout(res, 2000));
  };

  const createOrder = async () => {
    await addLog(`Creating order: ${srcAmount} ${src?.symbol} -> ${dstAmount} ${dst?.symbol} Time: ${time} minutes ... `);

    await addLog(`Generating secret for order...`);

    // Generate a random 32-byte preimage (secret)
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);
    const preimageHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Hash the preimage with SHA-256 to get the hashlock
    const encoder = new TextEncoder();
    const preimageBuffer = encoder.encode(preimageHex);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', preimageBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    await addLog(`Generated preimage (secret): 0x${preimageHex}`);
    await addLog(`Generated hashlock (sha256): 0x${hashHex}`);
    await addLog(`Connected wallet address: ${connectedWalletAddress}`);
    await addLog(`Creating order on relayer...`);

    // Calculate timelock (current time + duration in minutes, as UNIX timestamp)
    const now = Math.floor(Date.now() / 1000);
    const timelock = now + parseInt(time) * 60;

    // Prepare API body
    // secret: "0x" + preimageHex,
    const body = {
      status: "ACTIVE",
      makerDestinationChainAddress: destinationMakerAddress,
      makerSourceChainAddress: connectedWalletAddress,
      srcChain: src?.chain,
      destinationChain: dst?.chain,
      timelock,
      hashlock: "0x" + hashHex,

      srcTokenAddress: src?.tokenAddress,
      dstTokenAddress: dst?.tokenAddress,
      srcQty: Number(srcAmount),
      dstQty: Number(dstAmount),
      orderHash: ""
    };

    try {
      const response = await fetch("http://localhost:3001/fusion-plus/relayer/v1.0/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      await addLog(`Order submitted! Response: ${JSON.stringify(result)}`);
    } catch (err) {
      await addLog(`Order submission failed: ${err}`);
    }
  };

  return (
    <div className="flex w-full space-x-4 p-12">
      {/* Left: Chart */}
      <div className="w-1/2 h-[600px]">
        {src && (
          <TradingViewWidget
            key={`${src.symbol}-${dst.symbol}`}
            // The widget expects a string like "ETHEREUM:ETH", adjust as needed
            symbol={`${src.symbol}${dst.symbol}`}
          />
        )}
      </div>
      {/* <div className="mockup-code overflow-auto max-h-[500px]">
        <pre className="px-5 whitespace-pre-wrap break-words">
          {contractLogs.map((log, i) => (
            <div key={i}>
              <strong>Log:</strong> {log}
            </div>
          ))}
        </pre>
      </div> */}

      <div className="mockup-browser bg-accent h-200 w-150">
        <div className="mockup-browser-toolbar">
          <div className="input">Logs</div>
        </div>
        <div className="px-4 py-4 bg-neutral text-secondary h-full">
          {contractLogs.map((logStatement, i) => (
            <div>{`[${i + 1}] ${logStatement}`}</div>
          ))}
        </div>
      </div> 
 


      {/* Right: Swap UI (unchanged) */}
      <div className="w-1/2">
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-xl space-y-6">
          <h2 className="text-xl font-semibold">Swap</h2>

          {/* From Panel */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>You From</span>
              <button className="text-blue-500">Balance: 0</button>
            </div>
            <div className="flex flex-col space-y-2">
              <select
                value={srcTokenSymbol}
                onChange={e => setSrcTokenSymbol(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                {tokenSymbols.map(sym => (
                  <option key={sym} value={sym}>{sym}</option>
                ))}
              </select>

              {src && (
                <select
                  value={src.chainId}
                  onChange={e => {
                    const sel = srcOptions.find(o => o.chainId === +e.target.value);
                    if (sel) setSrc(sel);
                  }}
                  className="border px-2 py-1 rounded"
                >
                  {srcOptions.map(opt => (
                    <option key={opt.chainId} value={opt.chainId}>{opt.chain}</option>
                  ))}
                </select>
              )}

              {src && (
                <div className="flex items-center space-x-2">
                  <img src={src.logoURI} className="h-6 w-6" />
                  <span>{src.symbol} on {src.chain}</span>
                </div>
              )}

              <input
                type="number"
                value={srcAmount}
                onChange={e => setSrcAmount(e.target.value)}
                placeholder="0.0"
                className="w-full text-right text-2xl font-semibold bg-transparent border-none outline-none"
              />
              <div className="text-sm text-gray-500 text-right">~$0.00</div>
            </div>
          </div>

          <div className="flex justify-center -mt-4">
            <button onClick={handleSwap} className="bg-white rounded-full p-2 shadow-md">
              <ArrowsRightLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* To Panel */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>You To</span>
              <button className="text-blue-500">Balance: 0</button>
            </div>
            <div className="flex flex-col space-y-2">
              <select
                value={dstTokenSymbol}
                onChange={e => setDstTokenSymbol(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                {tokenSymbols.map(sym => (
                  <option key={sym} value={sym}>{sym}</option>
                ))}
              </select>

              {dst && (
                <select
                  value={dst.chainId}
                  onChange={e => {
                    const sel = dstOptions.find(o => o.chainId === +e.target.value);
                    if (sel) setDst(sel);
                  }}
                  className="border px-2 py-1 rounded"
                >
                  {dstOptions.map(opt => (
                    <option key={opt.chainId} value={opt.chainId}>{opt.chain}</option>
                  ))}
                </select>
              )}

              {dst && (
                <div className="flex items-center space-x-2">
                  <img src={dst.logoURI} className="h-6 w-6" />
                  <span>{dst.symbol} on {dst.chain}</span>
                </div>
              )}

              <input
                type="number"
                value={dstAmount}
                onChange={e => setDstAmount(e.target.value)}
                placeholder="0.0"
                className="w-full text-right text-2xl font-semibold bg-transparent border-none outline-none"
              />
              <div className="text-sm text-gray-500 text-right">~$0.00</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 p-4">

          </div>

          {/* Footer */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />

            </div>
            <div className="flex flex-col gap-2 m-2">
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <div className="flex items-center border rounded px-2 py-1 bg-gray-50">
                <input
                  type="number"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="Enter minutes"
                  className="flex-1 bg-transparent outline-none border-none"
                />
                <span className="text-gray-400 mr-1">minutes</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 m-2">
              <label className="text-sm font-medium text-gray-700">Destination Chain Address</label>
              <div className="flex items-center border rounded px-2 py-1 bg-gray-50">
                {/* <span className="text-gray-400 mr-1">https://</span> */}
                <input
                  type="text"
                  value={destinationMakerAddress}
                  onChange={e => setDestinationMakerAddress(e.target.value)}
                  placeholder="Enter destination chain address"
                  className="flex-1 bg-transparent outline-none border-none"
                />
              </div>
            </div>

            <button
              className="btn btn-sm btn-secondary w-full mt-4 p-2 h-10"
              onClick={createOrder}
              disabled={!src || !dst || !srcAmount || !dstAmount || !time || !destinationMakerAddress}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import { ArrowsRightLeftIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import tokenListData from './output.json';
import TradingViewWidget from './components/TradingView';

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

          {/* Footer */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
              Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

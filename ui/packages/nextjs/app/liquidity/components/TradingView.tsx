'use client';
import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;         // e.g. "BINANCE:BTCUSDT" or "Ethereum:ETH"
  interval?: string;      // e.g. "D", "60"
  timezone?: string;      // e.g. "Etc/UTC"
  theme?: 'light' | 'dark';
  style?: React.CSSProperties;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  interval = 'D',
  timezone = 'Etc/UTC',
  theme = 'light',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // clear any previous embeds
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      interval,
      timezone,
      theme,
      toolbar_bg: '#f1f3f6',
      hide_side_toolbar: false,
      allow_symbol_change: true,
      details: true,
      studies: ['MACD@tv-basicstudies'],
      withdateranges: true,
      width: '100%',
      height: '100%',
    });

    containerRef.current?.appendChild(script);
  }, [symbol, interval, timezone, theme]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={style ?? { width: '100%', height: '100%' }}
    />
  );
};

export default memo(TradingViewWidget);

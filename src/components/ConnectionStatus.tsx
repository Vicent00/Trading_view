'use client';

import { useMarketStore } from '@/store/marketStore';

export const ConnectionStatus = () => {
  const connectionState = useMarketStore((state) => state.connectionState);

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          dotColor: 'bg-emerald-500 shadow-lg shadow-emerald-500/50',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10 border-emerald-500/30',
          icon: '●',
          text: 'Conectado',
        };
      case 'connecting':
        return {
          dotColor: 'bg-cyan-500 animate-pulse shadow-lg shadow-cyan-500/50',
          textColor: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10 border-cyan-500/30',
          icon: '◐',
          text: 'Conectando...',
        };
      case 'disconnected':
        return {
          dotColor: 'bg-slate-500',
          textColor: 'text-slate-400',
          bgColor: 'bg-slate-500/10 border-slate-500/30',
          icon: '○',
          text: 'Desconectado',
        };
      case 'error':
        return {
          dotColor: 'bg-red-500 shadow-lg shadow-red-500/50',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500/10 border-red-500/30',
          icon: '✕',
          text: 'Error',
        };
      default:
        return {
          dotColor: 'bg-slate-500',
          textColor: 'text-slate-400',
          bgColor: 'bg-slate-500/10 border-slate-500/30',
          icon: '?',
          text: 'Desconocido',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300 ${config.bgColor}`}>
      <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor} transition-all duration-300`} />
      <span className={`text-sm font-semibold ${config.textColor} transition-colors duration-300`}>
        {config.text}
      </span>
    </div>
  );
};

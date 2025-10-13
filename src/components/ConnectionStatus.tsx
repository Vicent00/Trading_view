'use client';

import { useMarketStore } from '@/store/marketStore';

export const ConnectionStatus = () => {
  const connectionState = useMarketStore((state) => state.connectionState);

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          dotColor: 'bg-green-500 shadow-lg shadow-green-500/50',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10 border-green-500/30',
          icon: '●',
          text: 'Conectado',
        };
      case 'connecting':
        return {
          dotColor: 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50',
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10 border-yellow-500/30',
          icon: '◐',
          text: 'Conectando...',
        };
      case 'disconnected':
        return {
          dotColor: 'bg-gray-500',
          textColor: 'text-gray-400',
          bgColor: 'bg-gray-500/10 border-gray-500/30',
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
          dotColor: 'bg-gray-500',
          textColor: 'text-gray-400',
          bgColor: 'bg-gray-500/10 border-gray-500/30',
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

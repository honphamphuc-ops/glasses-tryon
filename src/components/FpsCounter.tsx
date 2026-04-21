import React from 'react';
import { RenderStats } from '@/hooks/useRenderStats';

interface FpsCounterProps {
  stats: RenderStats;
}

export const FpsCounter: React.FC<FpsCounterProps> = ({ stats }) => {
  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-1 rounded-lg bg-black/70 p-3 text-xs font-mono text-green-400 backdrop-blur-sm shadow-lg">
      <div className="flex justify-between gap-4">
        <span className="text-gray-300">Render FPS:</span>
        <span className={stats.fps < 50 ? 'text-yellow-400' : ''}>{stats.fps}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-gray-300">Track FPS:</span>
        <span className={stats.trackingFps < 25 ? 'text-yellow-400' : ''}>{stats.trackingFps}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-gray-300">Latency:</span>
        <span>{stats.latencyMs} ms</span>
      </div>
      <div className="mt-1 flex items-center gap-2 border-t border-gray-600 pt-1">
        <div className={`h-2 w-2 rounded-full ${stats.faceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-gray-300">
          {stats.faceDetected ? 'Face Detected' : 'No Face'}
        </span>
      </div>
    </div>
  );
};
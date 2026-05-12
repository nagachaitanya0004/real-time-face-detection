import React from 'react';
import { ROIRecord } from '../types';
import { clsx } from 'clsx';

interface ROITableProps {
  records: ROIRecord[];
}

export const ROITable: React.FC<ROITableProps> = ({ records }) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <h3 className="font-bold text-slate-200">Recent Detections</h3>
      </div>
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
            <tr>
              <th className="p-3">Frame</th>
              <th className="p-3">BBox (X,Y,W,H)</th>
              <th className="p-3">Conf.</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300">
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-3 font-mono text-xs">{r.frame_index}</td>
                <td className="p-3 text-xs">
                  {r.face_detected ? `${r.bbox_x},${r.bbox_y},${r.bbox_width},${r.bbox_height}` : '-'}
                </td>
                <td className="p-3">
                  {r.confidence ? <span className="text-blue-400">{(r.confidence * 100).toFixed(1)}%</span> : '-'}
                </td>
                <td className="p-3">
                  <span className={clsx(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    r.face_detected ? "bg-green-900/40 text-green-400 border border-green-800" : "bg-red-900/40 text-red-400 border border-red-800"
                  )}>
                    {r.face_detected ? 'Detected' : 'None'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

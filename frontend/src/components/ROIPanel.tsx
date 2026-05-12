/**
 * Purpose: Component for displaying a scrollable table of detected faces and metadata.
 */

import React from 'react';
import { ROIRecord } from '../types';
import { clsx } from 'clsx';

interface ROIPanelProps {
  records: ROIRecord[];
}

/**
 * Displays the ROI telemetry in a clean, scrollable table.
 * @param props Contains the array of ROI records to display.
 */
export const ROIPanel: React.FC<ROIPanelProps> = ({ records }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col h-[520px]">
      <div className="p-4 bg-slate-700 border-b border-slate-600">
        <h3 className="font-bold text-slate-100">Detections Log</h3>
      </div>
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-800 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-3 font-medium">Index</th>
              <th className="p-3 font-medium">BBox (X, Y, W, H)</th>
              <th className="p-3 font-medium">Conf.</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-300 text-sm">
            {records.map((record) => (
              <tr key={record.id} className="border-b border-slate-700 hover:bg-slate-750 transition-colors">
                <td className="p-3 font-mono text-xs">{record.frame_index}</td>
                <td className="p-3 text-xs">
                  {record.face_detected ? (
                    `${record.bbox_x}, ${record.bbox_y}, ${record.bbox_width}, ${record.bbox_height}`
                  ) : (
                    <span className="text-slate-500 italic">None</span>
                  )}
                </td>
                <td className="p-3">
                  {record.confidence ? (
                    <span className="font-medium text-blue-400">{(record.confidence * 100).toFixed(1)}%</span>
                  ) : '-'}
                </td>
                <td className="p-3">
                  <span className={clsx(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    record.face_detected ? "bg-green-900/40 text-green-400 border border-green-800" : "bg-red-900/40 text-red-400 border border-red-800"
                  )}>
                    {record.face_detected ? 'Detected' : 'No Face'}
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

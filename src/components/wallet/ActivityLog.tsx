import React from 'react';
import { useCredentialStore } from '@/stores/credentialStore';
import { formatDateTime } from '@/lib/utils/date';
import { CheckCircle, XCircle, Clock, Shield } from 'lucide-react';

export default function ActivityLog() {
  const activityLog = useCredentialStore((state) => state.activityLog);

  if (activityLog.length === 0) {
    return (
      <div className="card text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No activity yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Your verification history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activityLog.map((activity) => (
        <div key={activity.id} className="card">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${
                activity.status === 'success'
                  ? 'bg-green-100 text-green-600'
                  : activity.status === 'failed'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {activity.status === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : activity.status === 'failed' ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{activity.verifier}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {activity.type === 'disclosure' ? 'Shared: ' : 'Scanned: '}
                    {activity.claims.join(', ')}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : activity.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {activity.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {formatDateTime(activity.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

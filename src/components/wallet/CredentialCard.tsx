import React from 'react';
import type { Credential } from '@/types';
import { CreditCard, Shield, Calendar, User } from 'lucide-react';
import { formatDate, calculateAge } from '@/lib/utils/date';

interface CredentialCardProps {
  credential: Credential;
  onClick?: () => void;
}

export default function CredentialCard({ credential, onClick }: CredentialCardProps) {
  const getIcon = () => {
    switch (credential.type) {
      case 'government-id':
        return <Shield className="w-6 h-6" />;
      case 'drivers-license':
        return <CreditCard className="w-6 h-6" />;
      case 'student-id':
        return <User className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getTypeLabel = () => {
    switch (credential.type) {
      case 'government-id':
        return 'Government ID';
      case 'drivers-license':
        return "Driver's License";
      case 'student-id':
        return 'Student ID';
      default:
        return 'Credential';
    }
  };

  const age = calculateAge(credential.data.dateOfBirth);

  return (
    <div
      onClick={onClick}
      className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{getTypeLabel()}</h3>
            <p className="text-sm text-gray-500">{credential.issuer}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Active
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{credential.data.fullName}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            Born {formatDate(credential.data.dateOfBirth)} • Age {age}
          </span>
        </div>

        <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
          ID: {credential.data.idNumber}
        </div>
      </div>
    </div>
  );
}

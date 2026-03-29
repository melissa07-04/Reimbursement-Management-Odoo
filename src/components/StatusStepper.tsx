import React from 'react';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

export const StatusStepper = ({ expense }: { expense: any }) => {
  if (!expense.approvalFlow || expense.approvalFlow.length === 0) {
    return (
      <div className="flex items-center space-x-1 text-green-600 font-bold text-sm">
        <CheckCircle size={16} />
        <span>Auto-Approved</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm mt-2 flex-wrap">
      {expense.approvalFlow.map((stage: any, index: number) => {
        let Icon = Clock;
        let color = 'text-[#3A506B]';
        
        if (stage.status === 'Approved') {
          Icon = CheckCircle;
          color = 'text-green-600';
        } else if (stage.status === 'Rejected') {
          Icon = XCircle;
          color = 'text-red-600';
        } else if (index === expense.currentStageIndex && expense.status !== 'Rejected') {
          Icon = Clock;
          color = 'text-yellow-600';
        }

        return (
          <React.Fragment key={index}>
            <div className={`flex items-center space-x-1 ${color}`}>
              <Icon size={16} />
              <span className="font-medium">{stage.role}</span>
            </div>
            {index < expense.approvalFlow.length - 1 && (
              <ArrowRight size={16} className="text-[#3A506B]" />
            )}
          </React.Fragment>
        );
      })}
      
      {/* Final Status */}
      <ArrowRight size={16} className="text-[#3A506B]" />
      <div className={`flex items-center space-x-1 font-bold ${
        expense.status === 'Approved' ? 'text-green-600' :
        expense.status === 'Rejected' ? 'text-red-600' : 'text-[#0B132B]'
      }`}>
        {expense.status === 'Approved' ? <CheckCircle size={16}/> : expense.status === 'Rejected' ? <XCircle size={16}/> : <Clock size={16}/>}
        <span>{expense.status === 'Approved' ? 'Fully Approved' : expense.status === 'Rejected' ? 'Rejected' : 'In Progress'}</span>
      </div>
    </div>
  );
};

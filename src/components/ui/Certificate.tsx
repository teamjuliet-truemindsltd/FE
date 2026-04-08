import React from 'react';

interface CertificateProps {
  studentName: string;
  courseName: string;
  dateCompleted: string;
  certificateId: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  dateCompleted,
  certificateId,
}) => {
  return (
    <div
      id="certificate-container"
      className="bg-white text-slate-800 p-12 relative overflow-hidden font-sans"
      style={{
        width: '1056px', // 11 inches at 96 DPI (landscape)
        height: '816px', // 8.5 inches at 96 DPI
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative Borders */}
      <div className="absolute inset-4 border-[12px] border-primary-teal opacity-90" />
      <div className="absolute inset-8 border-[3px] border-primary-teal/40 border-dashed" />
      
      {/* Background patterns/blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-teal rounded-full blur-3xl opacity-10" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-deep-teal rounded-full blur-3xl opacity-10" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center z-10 px-16">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-[0.2em] text-primary-teal uppercase">
            TalentFlow Academy
          </h2>
          <div className="w-16 h-1 bg-primary-teal mx-auto mt-4 rounded-full" />
        </div>

        <h1 className="text-6xl font-black text-slate-900 mb-8 tracking-tight font-serif">
          Certificate of Completion
        </h1>

        <p className="text-xl text-slate-500 mb-8 uppercase tracking-widest">
          This is to proudly certify that
        </p>

        <h2 className="text-5xl font-bold text-primary-teal mb-8 capitalize italic font-serif">
          {studentName}
        </h2>

        <p className="text-xl text-slate-500 mb-8 max-w-2xl leading-relaxed">
          Has successfully completed all requirements and graduated from the comprehensive program
        </p>

        <h3 className="text-4xl font-bold text-slate-800 mb-16">
          {courseName}
        </h3>

        {/* Footer info (Date, ID, Signature) */}
        <div className="w-full flex justify-between items-end mt-auto pt-8 border-t border-slate-300">
          <div className="text-left w-64">
            <p className="text-lg font-bold text-slate-800 border-b border-slate-400 pb-2">{dateCompleted}</p>
            <p className="text-sm text-slate-500 uppercase tracking-widest mt-2">Date Awarded</p>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-teal/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-teal/30">
                <div className="w-16 h-16 bg-primary-teal/20 rounded-full flex items-center justify-center">
                    <span className="text-primary-teal font-black text-xl">TF</span>
                </div>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              ID: {certificateId}
            </p>
          </div>

          <div className="text-right w-64">
            <p className="text-lg font-bold text-slate-800 border-b border-slate-400 pb-2 italic font-serif">
               TalentFlow Board
            </p>
            <p className="text-sm text-slate-500 uppercase tracking-widest mt-2">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;

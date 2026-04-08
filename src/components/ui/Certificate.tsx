import React from 'react';

interface CertificateProps {
  studentName: string;
  courseName: string;
  dateCompleted: string;
  certificateId: string;
  instructorName?: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  dateCompleted,
  certificateId,
  instructorName = "Lead Instructor",
}) => {
  return (
    <div
      id="certificate-container"
      className="bg-white relative overflow-hidden font-sans"
      style={{
        width: '1056px', // 11 inches at 96 DPI (landscape)
        height: '816px', // 8.5 inches at 96 DPI
        boxSizing: 'border-box',
      }}
    >
      {/* 1. LAYERED BORDERS (Official Look) */}
      <div className="absolute inset-0 border-[24px] border-slate-900 z-10 pointer-events-none" />
      <div className="absolute inset-[30px] border-[2px] border-primary-teal/30 z-10 pointer-events-none" />
      <div className="absolute inset-[40px] border-[1px] border-slate-200 z-10 pointer-events-none" />

      {/* 2. PREMIUM BACKGROUND ACCENTS */}
      {/* Subtle geometric grid or pattern overlay could go here, but keeping it clean with gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-teal/10 via-deep-teal/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-primary-teal/10 via-emerald-500/5 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl opacity-60" />

      {/* Corporate Corner Accents */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-slate-900 z-20 shadow-2xl" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}>
         <div className="absolute top-10 left-10 text-white font-black text-3xl opacity-20 rotate-[-45deg]">TALENTFLOW</div>
      </div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-teal z-20 shadow-2xl" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}>
         <div className="absolute bottom-10 right-10 text-white font-black text-3xl opacity-20 rotate-[-45deg]">ACADEMY</div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="relative z-30 h-full flex flex-col items-center justify-center pt-20 pb-16 px-32 text-center text-slate-900">
        
        {/* Upper Branding */}
        <div className="mb-14 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="flex items-center gap-4 mb-3">
             <div className="w-14 h-14 bg-slate-900 border-2 border-primary-teal flex items-center justify-center text-white font-black text-3xl shadow-xl">
               TF
             </div>
             <div className="text-left">
               <div className="text-2xl font-black tracking-[0.3em] uppercase leading-none">TalentFlow</div>
               <div className="text-xs font-bold text-primary-teal tracking-[0.6em] uppercase mt-1">Academy of Excellence</div>
             </div>
          </div>
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-primary-teal to-transparent rounded-full" />
        </div>

        {/* The Title Section */}
        <div className="mb-8">
          <h1 className="text-5xl font-black tracking-[0.15em] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            CERTIFICATE OF COMPLETION
          </h1>
          <div className="flex items-center justify-center gap-4">
             <div className="h-px w-20 bg-slate-300" />
             <p className="text-lg text-slate-500 tracking-[0.25em] font-bold uppercase">This is to officially certify that</p>
             <div className="h-px w-20 bg-slate-300" />
          </div>
        </div>

        {/* THE STUDENT NAME (The Hero Piece) */}
        <div className="relative mb-14 w-full">
           <h2 className="text-8xl font-black tracking-tight text-slate-900 drop-shadow-xl py-6" style={{ fontFamily: 'Georgia, serif' }}>
              {studentName}
           </h2>
           {/* Subtle underline garnish */}
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 flex items-center gap-2">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-primary-teal" />
              <div className="w-3 h-3 bg-primary-teal rotate-45" />
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-primary-teal" />
           </div>
        </div>

        {/* Narrative */}
        <p className="text-xl text-slate-600 mb-10 max-w-3xl leading-relaxed font-medium">
          has successfully demonstrated exceptional competence and fulfilled all curriculum requirements for the mastery program in:
        </p>

        {/* COURSE NAME BOX */}
        <div className="mb-auto">
          <h3 className="text-4xl font-black text-primary-teal bg-primary-teal/5 border-2 border-primary-teal/20 px-20 py-6 rounded-[2rem] shadow-sm italic ring-8 ring-transparent hover:ring-primary-teal/5 transition-all duration-500">
            {courseName}
          </h3>
        </div>

        {/* 4. FOOTER (Status & Verification) */}
        <div className="w-full flex justify-between items-end mt-16 px-10">
          
          {/* Award Date */}
          <div className="w-64 text-center">
            <div className="border-b-2 border-slate-900 pb-2 mb-2 font-black text-xl text-slate-800">
               {dateCompleted}
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Date of Graduation</p>
          </div>

          {/* Verification / Seal */}
          <div className="relative -mb-4 flex flex-col items-center">
             <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Complex Star Seal */}
                <div className="absolute inset-0 bg-primary-teal/10 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-primary-teal shadow-2xl rotate-[22deg] rounded-lg opacity-90" />
                <div className="absolute inset-2 bg-primary-teal rotate-[67deg] rounded-lg opacity-90" />
                <div className="absolute inset-3 bg-slate-900 rounded-full flex items-center justify-center border-2 border-primary-teal/50">
                    <div className="flex flex-col items-center">
                       <span className="text-primary-teal text-3xl font-black tracking-tighter">TF</span>
                       <div className="h-[1px] w-8 bg-primary-teal/30 my-1" />
                       <span className="text-white text-[8px] font-black tracking-widest uppercase">VERIFIED</span>
                    </div>
                </div>
             </div>
             <div className="mt-4 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">ID: {certificateId.split('-')[0]}...</span>
             </div>
          </div>

          {/* Authority Signature */}
          <div className="w-64 text-center">
            <div className="border-b-2 border-slate-900 pb-2 mb-2 h-12 flex items-end justify-center">
               <span className="text-4xl text-slate-800 opacity-90 -rotate-2 select-none" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                  {instructorName}
               </span>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Authorized Signature</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Certificate;

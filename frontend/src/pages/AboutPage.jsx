import { FiUsers, FiCode, FiGithub } from 'react-icons/fi';

const team = [
  { name: 'Soroush Salari', studentId: '101537771' },
  { name: 'Laurence Liang', studentId: '101485895' },
  { name: 'Kathan Yatin Parikh', studentId: '101471907' },
  { name: 'Steven Nguyen', studentId: '101122624' },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">ABOUT US</h1>
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          </div>
          <p className="text-[#64748b] text-sm sm:text-base max-w-2xl mx-auto">
            Soccer Connect is a capstone project built to help soccer players find games, join teams, and connect with the community.
          </p>
        </div>

        {/* Project Info */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-[#1c2430] flex items-center gap-2">
            <FiCode className="w-4 h-4 text-[#22c55e]" />
            <span className="text-xs uppercase tracking-wider text-[#64748b]">Project</span>
          </div>
          <div className="p-6">
            <h2 className="text-white font-semibold text-lg mb-2">Soccer Connect</h2>
            <p className="text-[#94a3b8] text-sm leading-relaxed mb-4">
              A full-stack web application designed to bring soccer players together.
              Find pickup games, create or join teams, discover local fields, and connect
              with players in your area. Built with React, Node.js, Express, and MongoDB.
            </p>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Vercel'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1c2430] flex items-center gap-2">
            <FiUsers className="w-4 h-4 text-[#22c55e]" />
            <span className="text-xs uppercase tracking-wider text-[#64748b]">Team Members</span>
          </div>
          <div className="divide-y divide-[#1c2430]">
            {team.map((member) => (
              <div key={member.studentId} className="px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#4ade80] font-bold text-lg">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-[#64748b] text-sm font-mono">{member.studentId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <a
            href="https://github.com/DistinctDynamo/Capstone_Project_2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#141c28] border border-[#2a3a4d] text-[#94a3b8] hover:text-white hover:border-[#22c55e]/30 transition-colors text-sm"
          >
            <FiGithub className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

import { motion } from 'framer-motion';
import { MoreVertical, Download } from 'lucide-react';

const RecentMembersTable = ({ members }) => {
  const defaultMembers = [
    {
      id: 1,
      name: 'Jaxson Drago',
      memberId: 'ALN-9982',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATa6bjvus0C2b97Rqs2BnbuD7e44qijY2XzneTpARlvZyuv1DJJp0BS2qxYZviPMyTRl8ILyrGExwiXYSz3ytZ1CrWL_IxcsbrZJZEDjtwTdXrhS0Z7CIp2GlRwzeslYqdNgOIIR6CRMa83zdhvFj9rXyLkmZEwmtCOnwnBySukuviaYg6B_p5GV59_rkqE9YHRtqQJ8yXjjvrnno4kNmrOxZIpecZ-yQIQE78M8JTY3JOHBPew2aMUAS9Jum6y7d7cc8hiC09f23P',
      status: 'ACTIVE',
      statusColor: 'primary-fixed',
      tier: 'Premium Elite',
      lastRenewal: 'OCT 12, 2024',
      lastActive: '2 mins ago',
    },
    {
      id: 2,
      name: 'Elena Kross',
      memberId: 'ALN-2104',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOdnDRjh9_lh6PJv7D9ygpT25c1I3zXPsiVPZDDs6DHMxRqiPt4BKYW-4NHr2TF5MP0oEuEVzK9-ogYPUUdaIq1sCqGnTHFLHImNFwpyMbDlxZuP4gZsVo3s5Maw3BHjyX4uG5el7IbkCp0bVAny2Gpz5rw1FUyCcuaMa71BsGY6qxAswBLyFUbo_b3rO7O21AkH6uFkWQlJyf6euF7PX3RDyfw02ZgsZwZuKHKj4IIY8Eu4q7ysm6QLeXsCPllseScsdnaMMwCIFY',
      status: 'PENDING',
      statusColor: 'tertiary-container',
      tier: 'Standard',
      lastRenewal: 'NOV 01, 2024',
      lastActive: '1 hour ago',
    },
    {
      id: 3,
      name: 'Maddox Vance',
      memberId: 'ALN-7731',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrolZzKqCQP3KUd3Txa76gLEMo3jItGPLphwSPvd2G6A92C3Rqwj21-tD6FiP2F_VZ51z4fxLY_omI1j68sl8ivnpONRUFskyUjp96rdAMQsvruigPRdACDqJycvrzYusThBzTLZrZf7zDNmTi84YqWCxLdaGqrB_y2h1IhVnJvjq2yKoAzcrtRwkVaVMNa2W5JmDAsGSUXZivlIFsJpZGFW7cOm_lJ4eeQJQc7y65p87x77bVQAblkeoI97DOhz6E-Sc7YsDLCPW_',
      status: 'EXPIRED',
      statusColor: 'error',
      tier: 'Basic Tier',
      lastRenewal: 'SEP 28, 2024',
      lastActive: 'Yesterday',
    },
  ];

  const tableData = members || defaultMembers;

  return (
    <div className="bg-surface-container-low overflow-hidden border border-white/5">
      <div className="p-8 flex justify-between items-center border-b border-white/5">
        <h4 className="font-headline font-black text-xl uppercase tracking-wider italic">
          Recent Member Activity
        </h4>
        <button className="text-primary-fixed hover:text-white transition-colors flex items-center gap-2 font-headline text-xs tracking-widest">
          EXPORT DATA <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-highest/30">
              <th className="px-8 py-4 font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                Member Entity
              </th>
              <th className="px-8 py-4 font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                System Status
              </th>
              <th className="px-8 py-4 font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                Tiers
              </th>
              <th className="px-8 py-4 font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                Recalibration
              </th>
              <th className="px-8 py-4 font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                Pulse Check
              </th>
              <th className="px-8 py-4 font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tableData.map((member, index) => (
              <motion.tr
                key={member.id}
                className="hover:bg-white/[0.02] transition-colors group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img
                      className="h-10 w-10 rounded grayscale group-hover:grayscale-0 transition-all object-cover"
                      src={member.avatar}
                      alt={member.name}
                    />
                    <div>
                      <p className="font-bold text-on-surface">{member.name}</p>
                      <p className="text-xs text-on-surface-variant">ID: {member.memberId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 bg-${member.statusColor}/10 text-${member.statusColor} text-[10px] font-bold rounded-full border border-${member.statusColor}/20`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-on-surface font-headline uppercase tracking-tighter">
                  {member.tier}
                </td>
                <td className="px-8 py-6 text-sm font-headline">{member.lastRenewal}</td>
                <td className="px-8 py-6 text-sm text-on-surface-variant">{member.lastActive}</td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-white/5 flex justify-center">
        <button className="px-8 py-3 bg-surface-container-highest text-white font-headline text-xs tracking-widest uppercase hover:bg-white/10 transition-colors">
          Load Full Archive
        </button>
      </div>
    </div>
  );
};

export default RecentMembersTable;

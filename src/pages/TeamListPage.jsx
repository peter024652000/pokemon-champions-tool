import { useNavigate } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import { useLang } from '../context/LangContext';

export default function TeamListPage() {
  const { teams, createTeam, deleteTeam } = useTeams();
  const { lang } = useLang();
  const navigate = useNavigate();

  function handleNewTeam() {
    const id = createTeam(lang === 'zh' ? '新隊伍' : 'New Team');
    navigate(`/team/${id}`);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    deleteTeam(id);
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 xl:px-10 py-6">
      <h1 className="text-2xl font-black text-clay-charcoal mb-6">
        {lang === 'zh' ? '我的隊伍' : 'My Teams'}
      </h1>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="text-6xl">⚔️</div>
          <p className="text-clay-silver text-sm">
            {lang === 'zh' ? '還沒有任何隊伍' : 'No teams yet'}
          </p>
          <button
            onClick={handleNewTeam}
            className="px-8 py-3 bg-clay-blue hover:opacity-90 text-white font-bold rounded-full text-base transition-opacity shadow-clay"
          >
            {lang === 'zh' ? '建立第一支隊伍' : 'Create your first team'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              lang={lang}
              onClick={() => navigate(`/team/${team.id}`)}
              onDelete={e => handleDelete(e, team.id)}
            />
          ))}

          {/* New team card */}
          <button
            onClick={handleNewTeam}
            className="min-h-[200px] flex flex-col items-center justify-center gap-2
              bg-white rounded-[16px] border-2 border-dashed border-clay-border
              hover:border-clay-blue/50 hover:bg-clay-blue-light transition-all duration-150"
          >
            <span className="text-4xl text-clay-border">+</span>
            <span className="text-sm text-clay-silver font-semibold">
              {lang === 'zh' ? '新增隊伍' : 'New Team'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function TeamCard({ team, lang, onClick, onDelete }) {
  const slots = team.slots || Array(6).fill(null);

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-[16px] border border-clay-border shadow-clay p-4
        hover:shadow-clay-md hover:border-clay-blue/40 transition-all duration-150 cursor-pointer"
    >
      {/* Delete button */}
      <button
        onClick={onDelete}
        title={lang === 'zh' ? '刪除隊伍' : 'Delete team'}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-clay-oat hover:bg-red-100
          text-clay-silver hover:text-red-500 flex items-center justify-center text-xs
          transition-colors z-10"
      >
        ✕
      </button>

      {/* Title with edit hint */}
      <div className="flex items-center gap-1.5 mb-3 pr-8">
        <h2 className="font-bold text-clay-charcoal text-base truncate">
          {team.title || (lang === 'zh' ? '未命名隊伍' : 'Untitled Team')}
        </h2>
        <svg className="w-3.5 h-3.5 text-clay-border shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
        </svg>
      </div>

      {/* 2×3 sprite grid */}
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot, i) => (
          <div
            key={i}
            className="aspect-square bg-clay-oat rounded-[12px] flex items-center justify-center overflow-hidden"
          >
            {slot?.sprite ? (
              <img
                src={slot.sprite}
                alt={slot.zhName || slot.enName || ''}
                className="w-full h-full object-contain"
                onError={slot.spriteFallback
                  ? e => { e.currentTarget.src = slot.spriteFallback; e.currentTarget.onerror = null; }
                  : undefined}
              />
            ) : (
              <span className="text-clay-border text-xl">·</span>
            )}
          </div>
        ))}
      </div>

      {/* Pokemon count */}
      <p className="text-xs text-clay-silver mt-3">
        {slots.filter(Boolean).length} / 6 {lang === 'zh' ? '隻' : 'Pokémon'}
      </p>
    </div>
  );
}

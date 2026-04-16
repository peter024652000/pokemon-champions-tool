import { useState } from 'react';
import { SPEED_NATURES, SPEED_BENCHMARKS } from '../utils/constants';
import { calcSpeed, BP_MAX_PER_STAT, BP_TOTAL } from '../utils/calcStats';
import { fetchWithCache, getChineseName } from '../utils/pokeapi';

const BASE = 'https://pokeapi.co/api/v2';

function NatureBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors
        ${active ? 'bg-blue-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
      {label}
    </button>
  );
}

export default function SpeedCalculator({ baseSpeed, pokemonName }) {
  const [bp, setBp] = useState(0);
  const [natureMod, setNatureMod] = useState(1.0);

  const [oppQuery, setOppQuery] = useState('');
  const [oppData, setOppData] = useState(null);
  const [oppBp, setOppBp] = useState(0);
  const [oppNature, setOppNature] = useState(1.0);
  const [oppLoading, setOppLoading] = useState(false);
  const [oppError, setOppError] = useState('');

  const mySpeed = calcSpeed(baseSpeed, bp, natureMod);

  const handleOppSearch = async (e) => {
    e.preventDefault();
    if (!oppQuery.trim()) return;
    setOppLoading(true);
    setOppError('');
    setOppData(null);
    try {
      const poke = await fetchWithCache(`${BASE}/pokemon/${oppQuery.trim().toLowerCase()}`);
      const base = poke.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0;
      let zhName = null;
      try {
        const sp = await fetchWithCache(`${BASE}/pokemon-species/${poke.id}`);
        zhName = getChineseName(sp.names);
      } catch {}
      setOppData({ base, name: zhName || poke.name });
    } catch {
      setOppError('找不到寶可夢');
    } finally {
      setOppLoading(false);
    }
  };

  const oppSpeed = oppData ? calcSpeed(oppData.base, oppBp, oppNature) : null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold mb-1 text-gray-700">速度計算</h3>
        <p className="text-xs text-gray-400 mb-3">Lv.50・個體值 31・Champions BP 系統</p>

        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-gray-600">
            速度 BP：<span className="text-blue-600 font-bold">{bp}</span>
            <span className="text-gray-400"> / {BP_MAX_PER_STAT}</span>
          </label>
          <span className="text-xs text-gray-400">總上限 {BP_TOTAL} BP</span>
        </div>
        <input type="range" min={0} max={BP_MAX_PER_STAT} step={1} value={bp}
          onChange={e => setBp(Number(e.target.value))}
          className="w-full accent-blue-500" />
        <div className="flex justify-between text-xs text-gray-300 mt-0.5">
          <span>0</span><span>{BP_MAX_PER_STAT}</span>
        </div>

        <div className="flex gap-2 mt-3">
          {SPEED_NATURES.map(n => (
            <NatureBtn key={n.value} label={n.label} active={natureMod === n.value}
              onClick={() => setNatureMod(n.value)} />
          ))}
        </div>

        <div className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-center text-white shadow">
          <p className="text-xs opacity-80 mb-1">{pokemonName} 實際速度</p>
          <p className="text-5xl font-black tracking-tight">{mySpeed}</p>
        </div>
      </div>

      {/* Opponent comparison */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-sm font-bold text-gray-700 mb-2">對手速度比較</h4>
        <form onSubmit={handleOppSearch} className="flex gap-2 mb-2">
          <input type="text" value={oppQuery} onChange={e => setOppQuery(e.target.value)}
            placeholder="輸入對手寶可夢（英文名/編號）"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <button type="submit" disabled={oppLoading}
            className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
            {oppLoading ? '...' : '比較'}
          </button>
        </form>
        {oppError && <p className="text-xs text-red-500 mb-2">{oppError}</p>}

        {oppData && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600">
              {oppData.name} BP：<span className="text-slate-600 font-bold">{oppBp}</span>
            </label>
            <input type="range" min={0} max={BP_MAX_PER_STAT} step={1} value={oppBp}
              onChange={e => setOppBp(Number(e.target.value))}
              className="w-full accent-slate-500" />
            <div className="flex gap-2">
              {SPEED_NATURES.map(n => (
                <button key={n.value} onClick={() => setOppNature(n.value)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors
                    ${oppNature === n.value ? 'bg-slate-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {n.label}
                </button>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">{pokemonName}</p>
                <p className="text-2xl font-black text-blue-600">{mySpeed}</p>
              </div>
              <div className="text-center px-4">
                {mySpeed > oppSpeed
                  ? <span className="text-emerald-600 font-bold text-sm">先制 ▲{mySpeed - oppSpeed}</span>
                  : mySpeed === oppSpeed
                  ? <span className="text-gray-500 font-bold text-sm">同速</span>
                  : <span className="text-red-500 font-bold text-sm">後手 ▼{oppSpeed - mySpeed}</span>}
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{oppData.name}</p>
                <p className="text-2xl font-black text-slate-600">{oppSpeed}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark table */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-bold text-gray-500 mb-2">常見速度參考（0 BP・中性）</p>
        <div className="space-y-1">
          {SPEED_BENCHMARKS.map(b => {
            const bs = calcSpeed(b.base, 0, 1.0);
            const faster = mySpeed > bs;
            const tied = mySpeed === bs;
            return (
              <div key={b.name} className="flex items-center gap-2 text-xs">
                <span className="flex-1 text-gray-600 truncate">{b.name}</span>
                <span className="font-mono text-gray-500 w-8 text-right">{bs}</span>
                <span className={`w-12 text-right font-semibold ${tied ? 'text-gray-400' : faster ? 'text-emerald-600' : 'text-red-400'}`}>
                  {tied ? '同速' : faster ? '先制' : '後手'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

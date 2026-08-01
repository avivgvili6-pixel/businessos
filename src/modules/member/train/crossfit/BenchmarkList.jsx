import React, { useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Card, Button, Badge, SectionHeader, Tabs } from '../../../../components/ui/UI'
import { BENCHMARKS, BENCHMARK_CATEGORIES, classifyResult } from '../../../../data/crossfit/benchmarks'
import { WodTimer } from './WodTimer'

// Benchmark WOD list — The Girls / Heroes / Open, with PR tracking.
export function BenchmarkList({ prs = {}, onSavePR }) {
 const [tab, setTab] = useState('girls')
 const [activeWod, setActiveWod] = useState(null)

 const filtered = BENCHMARKS.filter(b => b.category === tab)

 function launchWod(bench) {
 setActiveWod({
 format: bench.format,
 title: bench.name,
 timeCap: bench.timeCap,
 lines: bench.lines,
 movements: [],
 _benchmarkId: bench.id,
 meta: bench.format === 'intervals'? { workSec: 60, restSec: 30 } : {},
 })
 }

 function handleComplete(result) {
 if (activeWod?._benchmarkId && onSavePR) {
 onSavePR({
 benchmarkId: activeWod._benchmarkId,
 time: result.finalTime,
 rounds: result.rounds,
 completedAt: result.completedAt,
 })
 }
 setActiveWod(null)
 }

 return (
 <div>
 <SectionHeader
 title="Benchmark WODs"
 subtitle="הקלאסיקות של עולם ה-WOD — התוצאות שלך נשמרות כשיאים אישיים"
 />

 <Tabs
 tabs={Object.entries(BENCHMARK_CATEGORIES).map(([key, info]) => ({
 key, label: info.he,
 }))}
 active={tab}
 onChange={setTab}
 />

 <div style={{ color: t.color.textDim, fontSize: t.font.sm, marginBottom: t.space.md }}>
 {BENCHMARK_CATEGORIES[tab]?.description}
 </div>

 <div style={{ display:'grid', gap: 12 }}>
 {filtered.map(bench => {
 const pr = prs[bench.id]
 const cls = pr ? classifyResult(bench, pr.time) : null
 return (
 <Card key={bench.id} hover>
 <div style={{ display:'flex', gap: 12, alignItems:'flex-start'}}>
 <div style={{ fontSize: 32 }}>{bench.icon}</div>
 <div style={{ flex: 1 }}>
 <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 4 }}>
 <span style={{ fontSize: t.font.lg, fontWeight: 800, color: t.color.gold }}>{bench.name}</span>
 {pr && cls && (
 <Badge color={cls.color}>{cls.tier === 'elite'? ' אליט': cls.tier === 'strong'? ' חזק':' הושלם'}</Badge>
 )}
 </div>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 8 }}>
 {bench.description}
 </div>
 <pre style={{
 fontFamily:'Space Mono, ui-monospace, monospace',
 fontSize: t.font.xs, color: t.color.text, lineHeight: 1.6,
 background: t.color.bg, padding: 10, borderRadius: t.radius.sm,
 whiteSpace:'pre-wrap', direction:'rtl', textAlign:'right', margin: 0,
 }}>{bench.lines.join('\n')}</pre>
 <div style={{ display:'flex', gap: 8, marginTop: 10, alignItems:'center', flexWrap:'wrap'}}>
 <div style={{ fontSize: t.font.xs, color: t.color.textMuted }}>
 אליט: <span style={{ color: t.color.gold }}>{bench.eliteBenchmark.male}/{bench.eliteBenchmark.female}</span>
 {' • '}
 ממוצע: {bench.avgTime.male}/{bench.avgTime.female}
 </div>
 {pr && (
 <Badge color={t.color.success}>
 השיא שלך: {formatMS(pr.time)}
 </Badge>
 )}
 </div>
 <Button variant="primary"size="sm" onClick={() => launchWod(bench)} style={{ marginTop: 12 }}>
 ▶ התחל
 </Button>
 </div>
 </div>
 </Card>
 )
 })}
 </div>

 <WodTimer
 wod={activeWod}
 open={!!activeWod}
 onClose={() => setActiveWod(null)}
 onComplete={handleComplete}
 />
 </div>
 )
}

function formatMS(sec) {
 if (sec == null) return '—'
 const m = Math.floor(sec / 60), s = sec % 60
 return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

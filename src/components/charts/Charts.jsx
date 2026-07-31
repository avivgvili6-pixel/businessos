import React from 'react'
import { t } from '../../theme/tokens'

export function Sparkline({ data, height = 40, color, fill = true }) {
  if (!data?.length) return null
  const w = 200, h = height
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1 || 1)
  const pts = data.map((v, i) => `${i*step},${h - ((v-min)/range) * (h-4) - 2}`)
  const c = color || t.color.gold
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      {fill && <polygon points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill={c} opacity="0.15" />}
      <polyline points={pts.join(' ')} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function BarChart({ data, labels, height = 140, color, formatValue }) {
  if (!data?.length) return null
  const max = Math.max(...data) || 1
  const c = color || t.color.gold
  return (
    <div style={{ display:'flex', gap:6, alignItems:'flex-end', height, marginTop: 8 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: t.color.textDim }}>{formatValue ? formatValue(v) : v}</div>
          <div style={{
            width:'100%', minHeight: 2, background: c, opacity: .4 + .6 * (v/max),
            borderRadius: 4, height: `${Math.max(2,(v/max)*(height-30))}px`,
            transition:'height .4s ease',
          }} />
          <div style={{ fontSize: 10, color: t.color.textMuted }}>{labels?.[i]}</div>
        </div>
      ))}
    </div>
  )
}

export function DonutSegments({ segments, size = 140, stroke = 20 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <div style={{ position:'relative', width:size, height:size, margin:'0 auto' }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={t.color.bgSoft} strokeWidth={stroke} fill="none" />
        {segments.map((s, i) => {
          const len = (s.value/total) * circ
          const el = (
            <circle key={i} cx={size/2} cy={size/2} r={r} stroke={s.color} strokeWidth={stroke} fill="none"
              strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} />
          )
          offset += len
          return el
        })}
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontWeight:800, fontSize:22, color:t.color.text }}>{Math.round(total)}</div>
        <div style={{ fontSize:10, color:t.color.textDim, letterSpacing:1 }}>סה״כ</div>
      </div>
    </div>
  )
}

export function Heatmap({ weeks = 8, seed = 0 }) {
  const cells = []
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const rnd = Math.abs(Math.sin((w*7+d + seed) * 12.9898)) % 1
      const v = rnd < .2 ? 0 : rnd < .4 ? 1 : rnd < .65 ? 2 : rnd < .85 ? 3 : 4
      cells.push(v)
    }
  }
  const colors = [t.color.bgSoft, `${t.color.gold}33`, `${t.color.gold}66`, `${t.color.gold}aa`, t.color.gold]
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${weeks}, 1fr)`, gap: 4 }}>
      {Array.from({length: 7}).map((_, d) => (
        <React.Fragment key={d}>
          {cells.filter((_,i) => i%7===d).map((v,i) => (
            <div key={`${d}-${i}`} style={{ aspectRatio:'1', background: colors[v], borderRadius: 3 }} />
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

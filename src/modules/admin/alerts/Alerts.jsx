import React, { useEffect, useState } from 'react'
import { LockedUntilData } from '../../../components/admin/LockedUntilData'
import { listAllMembers } from '../../../services/supabaseSync'
import { useI18n } from '../../../i18n/i18n'

const THRESHOLD = 20

export function Alerts() {
  const { isRTL } = useI18n()
  const [count, setCount] = useState(0)

  useEffect(() => {
    let mounted = true
    listAllMembers().then(members => {
      if (mounted) setCount(members?.length || 0)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <LockedUntilData
      title={isRTL ? 'התראות התערבות' : 'Intervention alerts'}
      threshold={THRESHOLD}
      currentCount={count}
      unit="members"
      hint={isRTL
        ? 'המערכת תסמן מתאמנים בסיכון עזיבה על סמך דבקות, ביקורים ורגש. פותח כשיש מסה קריטית של פעילות.'
        : 'The system will flag at-risk members from adherence, visits, and sentiment. Unlocks at a critical mass of activity.'}
    />
  )
}

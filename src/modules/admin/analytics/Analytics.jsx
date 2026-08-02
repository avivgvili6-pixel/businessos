import React, { useEffect, useState } from 'react'
import { LockedUntilData } from '../../../components/admin/LockedUntilData'
import { listAllMembers } from '../../../services/supabaseSync'
import { useI18n } from '../../../i18n/i18n'

const THRESHOLD = 30

// Analytics unlocks once the account has 30 real members — before that,
// retention curves are noise, funnels are anecdote, conversion means
// nothing. Show honest state, not fabricated charts.

export function Analytics() {
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
      title={isRTL ? 'אנליטיקה עסקית' : 'Business analytics'}
      threshold={THRESHOLD}
      currentCount={count}
      unit="members"
      hint={isRTL
        ? 'רטנשן, פאנלים ואחוזי המרה מתגלים כשיש מספיק מדגם. עד אז — הדשבורד נשמר נקי.'
        : 'Retention, funnels, and conversion rates need real sample size. Until then, the dashboard stays honest.'}
    />
  )
}

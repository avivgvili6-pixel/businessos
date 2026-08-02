import React, { useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Tabs } from '../../../../components/ui/UI'
import { useI18n } from '../../../../i18n/i18n'
import { ExplorePrograms } from './ExplorePrograms'
import { ExerciseLibrary } from './ExerciseLibrary'
import { MyRoutines } from './MyRoutines'
import { TrainerGenerator } from './TrainerGenerator'
import { LegendPrograms } from './LegendPrograms'

// Main tab for the Bodybuilding module. 5 sub-tabs.
export function BodybuildingHub() {
 const { t: tr } = useI18n()
 const [tab, setTab] = useState('trainer')

 return (
 <div>
 <Tabs
 tabs={[
 { key:'trainer', label: tr('bb.tab.trainer','המחולל') },
 { key:'legends', label: tr('bb.tab.legends','Legends') },
 { key:'programs', label: tr('bb.tab.programs','תוכניות') },
 { key:'routines', label: tr('bb.tab.routines','Routines') },
 { key:'exercises', label: tr('bb.tab.exercises','מאגר תרגילים') },
 ]}
 active={tab}
 onChange={setTab}
 />

 {tab === 'trainer'&& <TrainerGenerator />}
 {tab === 'legends'&& <LegendPrograms />}
 {tab === 'programs'&& <ExplorePrograms />}
 {tab === 'routines'&& <MyRoutines />}
 {tab === 'exercises' && <ExerciseLibrary />}
 </div>
 )
}

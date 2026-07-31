// Data Service - abstracts persistence away from UI/store.
// Today: localStorage. Tomorrow: Supabase/Firebase - no UI change.
//
// Usage:
//   import { dataService } from '../services/dataService'
//   await dataService.getState()
//   await dataService.setState(newState)
//
// To swap backend later: implement the same interface against your
// preferred provider and set dataService = new SupabaseDataService() etc.

import { storage } from '../utils/storage'

class LocalDataService {
  constructor() {
    this.namespace = 'hfos:'
    this.userKey = 'state'
  }

  async getState() { return storage.get(this.userKey) }
  async setState(state) { storage.set(this.userKey, state); return state }
  async clearState() { storage.remove(this.userKey) }

  // future backend methods (all no-op today, ready for swap)
  async signIn(_email, _pw) { return { userId: 'local-user' } }
  async signOut() { return true }
  async currentUser() { return { userId: 'local-user' } }

  // future - team-level data (currently reads from static mock)
  async listMembers() {
    const { mockMembers } = await import('../data/mockUsers')
    return mockMembers
  }
  async listTeam() {
    const { mockTeam } = await import('../data/mockUsers')
    return mockTeam
  }
  async listAlerts() {
    const { mockAlerts } = await import('../data/mockUsers')
    return mockAlerts
  }
}

// SupabaseDataService.js (future):
//   class SupabaseDataService {
//     async getState() { const {data} = await supabase.from('user_state').select('*').single(); return data?.state }
//     async setState(state) { await supabase.from('user_state').upsert({ id: user.id, state }); return state }
//     async listMembers() { const {data} = await supabase.from('members').select('*'); return data }
//   }

export const dataService = new LocalDataService()

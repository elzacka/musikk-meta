import { StaticBrain } from './staticBrain'
import { GoogleSheetsBrain } from './googleSheetsBrain'

// Simple, modern brain client selection
const createBrainClient = () => {
  const isGitHubPages = window.location.hostname.includes('github.io')
  const hasGoogleSheetsConfig = !!(
    import.meta.env?.VITE_GOOGLE_SHEET_ID && 
    import.meta.env?.VITE_GOOGLE_SHEETS_API_KEY
  )

  // Priority 1: Use Google Sheets if configured
  if (hasGoogleSheetsConfig) {
    console.log('🔗 Using Google Sheets as data source')
    return new GoogleSheetsBrain()
  }

  // Priority 2: Use static sample data for demo
  console.log('📊 Using static sample data (demo mode)')
  return new StaticBrain()
}

export const brain = createBrainClient()
export default brain
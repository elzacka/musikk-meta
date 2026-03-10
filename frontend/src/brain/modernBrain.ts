import { HybridBrain } from './hybridBrain';
import { GoogleSheetsBrain } from './googleSheetsBrain';
import type { MusicDataSource } from '@/types/music';

const createBrainClient = (): MusicDataSource => {
  const hasGoogleSheetsConfig = !!(
    import.meta.env?.VITE_GOOGLE_SHEET_ID &&
    import.meta.env?.VITE_GOOGLE_SHEETS_API_KEY
  );

  const local = hasGoogleSheetsConfig ? new GoogleSheetsBrain() : null;

  // HybridBrain: Deezer for universelt søk + lokale spor med audio features
  return new HybridBrain(local);
};

export const brain = createBrainClient();
export default brain;

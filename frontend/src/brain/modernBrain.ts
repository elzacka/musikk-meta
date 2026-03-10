import { StaticBrain } from './staticBrain';
import { GoogleSheetsBrain } from './googleSheetsBrain';

const createBrainClient = () => {
  const hasGoogleSheetsConfig = !!(
    import.meta.env?.VITE_GOOGLE_SHEET_ID &&
    import.meta.env?.VITE_GOOGLE_SHEETS_API_KEY
  );

  if (hasGoogleSheetsConfig) {
    return new GoogleSheetsBrain();
  }

  return new StaticBrain();
};

export const brain = createBrainClient();
export default brain;

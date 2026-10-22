export interface ChecklistItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  checked?: boolean;
}

export type ColumnCount = 2 | 3;
export type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl';
export type PhotoSizeOption = 'sm' | 'md' | 'lg';
export type ItemSpacingOption = 'compact' | 'balanced' | 'spacious';
export type CheckboxStyle = 'standard' | 'large' | 'conforming';

export interface HeaderFieldsConfig {
  showDate: boolean;
  dateLabel: string;
  showInspector: boolean;
  inspectorLabel: string;
  showSignature: boolean;
  signatureLabel: string;
  showLocation: boolean;
  locationLabel: string;
}

export interface ChecklistConfig {
  id: string;
  title: string;
  subtitle: string;
  companyLogoUrl?: string;
  showCompanyLogo?: boolean;
  companyName?: string;
  showCompanyName?: boolean;
  columns: ColumnCount;
  fontSize: FontSizeOption;
  photoSize: PhotoSizeOption;
  itemSpacing: ItemSpacingOption;
  checkboxStyle: CheckboxStyle;
  showItemNumbers: boolean;
  highContrast: boolean;
  showNotesArea: boolean;
  notesTitle: string;
  notesLines: number;
  headerFields: HeaderFieldsConfig;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

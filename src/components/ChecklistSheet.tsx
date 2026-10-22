import React from 'react';
import { ChecklistConfig, ChecklistItem } from '../types/checklist';
import { Edit2, Camera, Upload, Trash2, CheckSquare } from 'lucide-react';

interface ChecklistSheetProps {
  config: ChecklistConfig;
  interactive?: boolean;
  onEditItem?: (item: ChecklistItem) => void;
  onQuickUploadPhoto?: (itemId: string, file: File) => void;
  onOpenCameraForItem?: (item: ChecklistItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onToggleCheck?: (itemId: string) => void;
  onUpdateHeaderField?: (field: keyof ChecklistConfig, value: any) => void;
  onUploadLogo?: (file: File) => void;
  printableOnly?: boolean;
}

export const ChecklistSheet: React.FC<ChecklistSheetProps> = ({
  config,
  interactive = true,
  onEditItem,
  onQuickUploadPhoto,
  onOpenCameraForItem,
  onDeleteItem,
  onToggleCheck,
  onUploadLogo,
  printableOnly = false,
}) => {
  const {
    title,
    subtitle,
    companyLogoUrl,
    showCompanyLogo,
    companyName,
    showCompanyName,
    columns,
    fontSize,
    photoSize,
    itemSpacing,
    checkboxStyle,
    showItemNumbers,
    highContrast,
    showNotesArea,
    notesTitle,
    notesLines,
    headerFields,
    items,
  } = config;

  // Detecção de 3 colunas para calibração de proporções
  const isThreeCols = columns === 3;

  // Tipografia ajustada dinamicamente: em 3 colunas ou 2 colunas o texto NUNCA é truncado com '...'
  const fontClasses = isThreeCols
    ? {
        sm: {
          title: 'text-[11px] sm:text-xs font-bold leading-tight break-words',
          subtitle: 'text-[9.5px] sm:text-[10.5px] text-slate-600 leading-tight break-words',
          number: 'text-[10px] sm:text-xs font-bold text-slate-500',
        },
        base: {
          title: 'text-xs sm:text-sm font-bold leading-snug break-words',
          subtitle: 'text-[10px] sm:text-xs text-slate-600 leading-tight break-words',
          number: 'text-xs sm:text-sm font-bold text-slate-500',
        },
        lg: {
          title: 'text-sm sm:text-base font-extrabold leading-snug break-words',
          subtitle: 'text-[11px] sm:text-xs text-slate-700 leading-tight break-words',
          number: 'text-sm sm:text-base font-extrabold text-slate-600',
        },
        xl: {
          title: 'text-base sm:text-lg font-black leading-snug break-words',
          subtitle: 'text-xs sm:text-sm text-slate-800 font-medium leading-tight break-words',
          number: 'text-base sm:text-lg font-black text-slate-700',
        },
      }[fontSize]
    : {
        sm: {
          title: 'text-xs sm:text-sm font-bold leading-tight break-words',
          subtitle: 'text-[11px] sm:text-xs text-slate-600 leading-tight break-words',
          number: 'text-xs font-bold text-slate-500',
        },
        base: {
          title: 'text-sm sm:text-base font-bold leading-snug break-words',
          subtitle: 'text-xs text-slate-600 leading-tight break-words',
          number: 'text-sm font-bold text-slate-500',
        },
        lg: {
          title: 'text-base sm:text-lg font-extrabold leading-snug break-words',
          subtitle: 'text-xs sm:text-sm text-slate-700 leading-tight break-words',
          number: 'text-base font-extrabold text-slate-600',
        },
        xl: {
          title: 'text-lg sm:text-xl font-black leading-snug break-words',
          subtitle: 'text-sm text-slate-800 font-medium leading-tight break-words',
          number: 'text-lg font-black text-slate-700',
        },
      }[fontSize];

  // Proporções das fotos adaptadas: em 3 colunas otimiza a largura para deixar mais espaço ao nome do item
  const photoDimensions = isThreeCols
    ? {
        sm: 'w-8 h-8 min-w-8 min-h-8 sm:w-9 sm:h-9',
        md: 'w-11 h-11 min-w-11 min-h-11 sm:w-12 sm:h-12',
        lg: 'w-14 h-14 min-w-14 min-h-14 sm:w-15 sm:h-15',
      }[photoSize]
    : {
        sm: 'w-10 h-10 min-w-10 min-h-10 sm:w-11 sm:h-11',
        md: 'w-14 h-14 min-w-14 min-h-14 sm:w-16 sm:h-16',
        lg: 'w-18 h-18 min-w-18 min-h-18 sm:w-20 sm:h-20',
      }[photoSize];

  // Spacing classes between items
  const spacingClasses = {
    compact: 'gap-1.5 p-1',
    balanced: 'gap-2 p-1.5 sm:p-2',
    spacious: 'gap-3 p-2 sm:p-2.5',
  }[itemSpacing];

  const gridColsClass = columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';

  // Checkbox size classes
  const checkboxBoxClasses = {
    standard: 'w-6 h-6 min-w-6 min-h-6 border-2 border-slate-900 rounded-sm',
    large: 'w-8 h-8 min-w-8 min-h-8 border-[2.5px] border-slate-900 rounded-md',
    conforming: 'w-6 h-6 min-w-6 min-h-6 border-2 border-slate-900 rounded-sm',
  }[checkboxStyle];

  const handleFileInputChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onQuickUploadPhoto) {
      onQuickUploadPhoto(itemId, e.target.files[0]);
    }
  };

  return (
    <div
      className={`a4-print-sheet bg-white text-slate-900 mx-auto flex flex-col justify-between select-text ${
        printableOnly ? '' : 'p-4 sm:p-6 rounded-none sm:rounded-lg'
      }`}
      style={{
        width: '100%',
        maxWidth: printableOnly ? '198mm' : '794px',
        minHeight: printableOnly ? '280mm' : 'auto',
      }}
    >
      {/* CABEÇALHO SUPERIOR DO CHECKLIST */}
      <div className="border-b-2 border-slate-900 pb-2 mb-2 shrink-0">
        {/* Barra Corporativa: Logotipo + Nome da Empresa + Indicador de Página */}
        {(showCompanyLogo || showCompanyName) && (
          <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              {showCompanyLogo && companyLogoUrl && (
                <div className="relative group/logo shrink-0">
                  <img
                    src={companyLogoUrl}
                    alt={companyName || 'Logotipo da Empresa'}
                    className="h-10 sm:h-12 w-auto max-w-[130px] object-contain rounded-xs border border-slate-200 p-0.5 bg-white shadow-2xs"
                  />
                  {interactive && !printableOnly && onUploadLogo && (
                    <label
                      title="Clique para trocar o logotipo da empresa"
                      className="no-print absolute inset-0 bg-black/65 opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-xs flex items-center justify-center cursor-pointer text-white"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) onUploadLogo(e.target.files[0]);
                        }}
                      />
                    </label>
                  )}
                </div>
              )}

              {showCompanyName && (
                <div className="leading-tight">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 block">
                    {companyName || 'Gauchão Restaurante e Cozinha Industrial'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                    Controle de Qualidade & Boas Práticas
                  </span>
                </div>
              )}
            </div>

            <div className="text-right text-[10px] font-mono font-bold text-slate-600 shrink-0">
              <span className="border border-slate-300 px-2 py-0.5 rounded bg-slate-50">
                PÁGINA 1 / 1
              </span>
            </div>
          </div>
        )}

        {/* Título Principal do Checklist */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 leading-none">
              {title || 'CHECKLIST DE INSPEÇÃO'}
            </h1>
            {subtitle && (
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {!(showCompanyLogo || showCompanyName) && (
            <div className="text-right text-[11px] font-mono text-slate-600 shrink-0 hidden sm:block">
              <span>PÁGINA 1 / 1</span>
            </div>
          )}
        </div>

        {/* Linhas de Preenchimento Manual (Data, Responsável, Assinatura, Local) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-300 text-xs text-slate-800">
          {headerFields.showDate && (
            <div className="flex items-baseline gap-1">
              <span className="font-bold shrink-0">{headerFields.dateLabel}</span>
              <span className="border-b border-slate-400 flex-1 min-w-16 h-4"></span>
            </div>
          )}
          {headerFields.showLocation && (
            <div className="flex items-baseline gap-1">
              <span className="font-bold shrink-0">{headerFields.locationLabel}</span>
              <span className="border-b border-slate-400 flex-1 min-w-16 h-4"></span>
            </div>
          )}
          {headerFields.showInspector && (
            <div className="flex items-baseline gap-1">
              <span className="font-bold shrink-0">{headerFields.inspectorLabel}</span>
              <span className="border-b border-slate-400 flex-1 min-w-16 h-4"></span>
            </div>
          )}
          {headerFields.showSignature && (
            <div className="flex items-baseline gap-1">
              <span className="font-bold shrink-0">{headerFields.signatureLabel}</span>
              <span className="border-b border-slate-400 flex-1 min-w-16 h-4"></span>
            </div>
          )}
        </div>
      </div>

      {/* GRADE DE ITENS: [FOTO] - [QUADRADINHO DE ASSINALAR] - [NOME DO ITEM] */}
      <div className={`grid ${gridColsClass} ${spacingClasses} flex-1 content-start`}>
        {items.map((item, index) => {
          const itemNum = String(index + 1).padStart(2, '0');

          return (
            <div
              key={item.id}
              className={`a4-item-card group relative flex items-center gap-2.5 border ${
                highContrast ? 'border-slate-800 bg-white' : 'border-slate-300 bg-slate-50/50'
              } rounded-md p-1.5 transition-colors hover:border-slate-900 hover:bg-slate-50`}
            >
              {/* 1. FOTO DO ITEM */}
              <div
                className={`relative ${photoDimensions} rounded bg-slate-100 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center`}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                    <Camera className="w-4 h-4" />
                    <span className="text-[9px] mt-0.5 font-bold">SEM FOTO</span>
                  </div>
                )}

                {/* Ações interativas sobre a foto (Apenas tela, ocultas na impressão) */}
                {interactive && !printableOnly && (
                  <div className="no-print absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <label
                      title="Carregar foto local"
                      className="cursor-pointer p-1 rounded bg-white text-slate-900 hover:bg-slate-200"
                    >
                      <Upload className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileInputChange(item.id, e)}
                      />
                    </label>
                    {onOpenCameraForItem && (
                      <button
                        title="Tirar foto com a câmera"
                        onClick={() => onOpenCameraForItem(item)}
                        className="p-1 rounded bg-white text-slate-900 hover:bg-slate-200"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 2. ESPAÇO PARA ASSINALAR ("QUADRADINHO PEQUENO / NÍTIDO") */}
              <div className="shrink-0 flex flex-col items-center justify-center">
                {checkboxStyle === 'conforming' ? (
                  /* Estilo Duplo: Conforme [C] / Não-Conforme [NC] */
                  <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-700">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 border-2 border-slate-900 rounded-sm bg-white flex items-center justify-center" />
                      <span className="text-[10px]">C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 border-2 border-slate-900 rounded-sm bg-white flex items-center justify-center" />
                      <span className="text-[10px]">NC</span>
                    </div>
                  </div>
                ) : (
                  /* Estilo Padrão: 1 quadradinho claro para marcar com caneta */
                  <button
                    type="button"
                    onClick={() => interactive && onToggleCheck && onToggleCheck(item.id)}
                    className={`${checkboxBoxClasses} bg-white flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors shrink-0`}
                    title="Espaço para assinalar com caneta (ou clique para marcar digitalmente)"
                  >
                    {item.checked && (
                      <span className="text-slate-950 font-black text-sm sm:text-base leading-none">
                        ✕
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* 3. NOME E DESCRIÇÃO DO ITEM - SEMPRE COMPLETO, NUNCA TRUNCADO COM '...' */}
              <div className="flex-1 min-w-0 pr-0.5 py-0.5">
                <div className="flex items-start gap-1">
                  {showItemNumbers && (
                    <span className={`${fontClasses.number} tabular-nums shrink-0 pt-0.5`}>
                      {itemNum}.
                    </span>
                  )}
                  <h2 className={`${fontClasses.title} text-slate-950 break-words leading-tight flex-1`}>
                    {item.title}
                  </h2>
                </div>
                {item.subtitle && (
                  <p className={`${fontClasses.subtitle} break-words mt-0.5`}>
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Controles de edição rápida em tela (invisíveis na impressão) */}
              {interactive && !printableOnly && (
                <div className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-xs p-0.5 rounded shadow-xs border border-slate-200">
                  {onEditItem && (
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      title="Editar nome / foto deste item"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  {onDeleteItem && (
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                      title="Remover item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* RODAPÉ: OBSERVAÇÕES / OCORRÊNCIAS */}
      {showNotesArea && (
        <div className="mt-2 pt-2 border-t-2 border-slate-900 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {notesTitle}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Total de Itens: {items.length}
            </span>
          </div>
          <div className="space-y-2">
            {Array.from({ length: notesLines }).map((_, idx) => (
              <div key={idx} className="border-b border-dashed border-slate-400 h-4 w-full" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

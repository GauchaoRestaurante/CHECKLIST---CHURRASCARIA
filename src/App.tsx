import React, { useState, useEffect, useRef } from 'react';
import {
  ChecklistConfig,
  ChecklistItem,
  ColumnCount,
  FontSizeOption,
  PhotoSizeOption,
  ItemSpacingOption,
  CheckboxStyle,
} from './types/checklist';
import { ChecklistSheet } from './components/ChecklistSheet';
import { CameraModal } from './components/CameraModal';
import { ItemEditorModal } from './components/ItemEditorModal';
import { ChecklistLibraryModal } from './components/ChecklistLibraryModal';
import { PageFitIndicator, calculateA4Fit } from './components/PageFitIndicator';
import {
  getInitialChecklist,
  saveActiveChecklist,
  saveChecklistToLibrary,
} from './utils/storage';
import {
  Printer,
  FolderOpen,
  Plus,
  Settings,
  ListOrdered,
  Eye,
  Camera,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Info,
  Type,
  LayoutGrid,
} from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<ChecklistConfig>(getInitialChecklist);
  const [activeTab, setActiveTab] = useState<'items' | 'layout'>('items');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modals state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [cameraTargetItem, setCameraTargetItem] = useState<ChecklistItem | null>(null);
  const [showPrintTips, setShowPrintTips] = useState(false);

  // Auto-save on every change
  useEffect(() => {
    saveActiveChecklist(config);
  }, [config]);

  // Handle Item Operations
  const handleAddItem = () => {
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      title: `Novo Item ${config.items.length + 1}`,
      subtitle: '',
      imageUrl: '',
      checked: false,
    };
    setConfig((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setEditingItem(newItem);
    setIsEditorOpen(true);
  };

  const handleUpdateItem = (updated: ChecklistItem) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === updated.id ? updated : i)),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.items.length) return;

    const newItems = [...config.items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setConfig((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleToggleCheck = (itemId: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId ? { ...i, checked: !i.checked } : i
      ),
    }));
  };

  const handleClearAllChecks = () => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((i) => ({ ...i, checked: false })),
    }));
  };

  // Quick photo upload from file picker
  const handleQuickUploadPhoto = (itemId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setConfig((prev) => ({
          ...prev,
          items: prev.items.map((i) =>
            i.id === itemId ? { ...i, imageUrl: e.target?.result as string } : i
          ),
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Camera capture
  const handleOpenCameraForItem = (item: ChecklistItem) => {
    setCameraTargetItem(item);
    setIsCameraOpen(true);
  };

  const handleCameraCaptureConfirm = (imageDataUrl: string) => {
    if (cameraTargetItem) {
      setConfig((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === cameraTargetItem.id ? { ...i, imageUrl: imageDataUrl } : i
        ),
      }));
    }
  };

  // Upload do logotipo da empresa
  const handleUploadCompanyLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setConfig((prev) => ({
          ...prev,
          companyLogoUrl: e.target?.result as string,
          showCompanyLogo: true,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-fit function for 1 A4 Page: calibra com precisão considerando logotipo e nome da empresa
  const handleAutoFitA4 = () => {
    const count = config.items.length;
    const hasCompanyHeader = config.showCompanyLogo || config.showCompanyName;

    let newColumns: ColumnCount = config.columns;
    let newFontSize: FontSizeOption = config.fontSize;
    let newPhotoSize: PhotoSizeOption = config.photoSize;
    let newItemSpacing: ItemSpacingOption = config.itemSpacing;
    let newNotesLines = config.notesLines;

    if (hasCompanyHeader) {
      // Quando há logotipo e nome da empresa no topo:
      if (count <= 8) {
        newColumns = 2;
        newFontSize = 'lg';
        newPhotoSize = 'md';
        newItemSpacing = 'balanced';
        newNotesLines = 2;
      } else if (count <= 11) {
        newColumns = 2;
        newFontSize = 'base';
        newPhotoSize = 'md';
        newItemSpacing = 'compact';
        newNotesLines = 2;
      } else if (count <= 13) {
        newColumns = 2;
        newFontSize = 'base';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      } else if (count <= 18) {
        newColumns = 3;
        newFontSize = 'base';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      } else {
        newColumns = 3;
        newFontSize = 'sm';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      }
    } else {
      if (count <= 10) {
        newColumns = 2;
        newFontSize = 'lg';
        newPhotoSize = 'md';
        newItemSpacing = 'balanced';
        newNotesLines = 2;
      } else if (count <= 13) {
        newColumns = 2;
        newFontSize = 'base';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 2;
      } else if (count <= 18) {
        newColumns = 3;
        newFontSize = 'base';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      } else {
        newColumns = 3;
        newFontSize = 'sm';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      }
    }

    setConfig((prev) => ({
      ...prev,
      columns: newColumns,
      fontSize: newFontSize,
      photoSize: newPhotoSize,
      itemSpacing: newItemSpacing,
      notesLines: newNotesLines,
    }));
  };

  const handlePrint = () => {
    setShowPrintTips(true);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleNewEmpty = () => {
    const blank: ChecklistConfig = {
      id: `checklist-${Date.now()}`,
      title: 'MEU NOVO CHECKLIST',
      subtitle: 'Instruções para conferência e preenchimento manual',
      columns: 2,
      fontSize: 'lg',
      photoSize: 'md',
      itemSpacing: 'balanced',
      checkboxStyle: 'standard',
      showItemNumbers: true,
      highContrast: true,
      showNotesArea: true,
      notesTitle: 'Observações:',
      notesLines: 2,
      headerFields: {
        showDate: true,
        dateLabel: 'Data:',
        showInspector: true,
        inspectorLabel: 'Responsável:',
        showSignature: true,
        signatureLabel: 'Assinatura:',
        showLocation: true,
        locationLabel: 'Setor:',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        { id: `item-1`, title: 'Item 01', subtitle: 'Descrição do primeiro item', imageUrl: '', checked: false },
        { id: `item-2`, title: 'Item 02', subtitle: 'Descrição do segundo item', imageUrl: '', checked: false },
        { id: `item-3`, title: 'Item 03', subtitle: 'Descrição do terceiro item', imageUrl: '', checked: false },
        { id: `item-4`, title: 'Item 04', subtitle: 'Descrição do quarto item', imageUrl: '', checked: false },
      ],
    };
    setConfig(blank);
    saveChecklistToLibrary(blank);
  };

  // Alternador inteligente de colunas que calibra proporções para nunca truncar texto
  const handleSwitchColumns = (cols: ColumnCount) => {
    setConfig((prev) => {
      if (cols === 3) {
        return {
          ...prev,
          columns: 3,
          // Em 3 colunas, adapta o tamanho da foto para dar mais espaço ao texto completo
          photoSize: prev.photoSize === 'lg' ? 'md' : prev.photoSize,
        };
      }
      return {
        ...prev,
        columns: 2,
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      {/* 1. TOP BAR: Conforme contrato de 3 zonas da diretriz */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Zona 1: Nome da Ferramenta */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
            A4
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none whitespace-nowrap">
              Checklist A4 com Fotos
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
              Otimizado para caber em 1 página e com alta legibilidade
            </p>
          </div>
        </div>

        {/* Zona 2: Controles Rápidos de Colunas e Acessibilidade */}
        <div className="hidden md:flex items-center gap-2">
          {/* Alternador de 2 ou 3 Colunas */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => handleSwitchColumns(2)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                config.columns === 2
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2 Colunas
            </button>
            <button
              onClick={() => handleSwitchColumns(3)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                config.columns === 3
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3 Colunas
            </button>
          </div>

          {/* Atalho de Tamanho de Fonte para Idosos */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <Type className="w-3 h-3" />
              Fonte:
            </span>
            <button
              onClick={() => setConfig((p) => ({ ...p, fontSize: 'base' }))}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                config.fontSize === 'base'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setConfig((p) => ({ ...p, fontSize: 'lg' }))}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                config.fontSize === 'lg'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grande
            </button>
            <button
              onClick={() => setConfig((p) => ({ ...p, fontSize: 'xl' }))}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                config.fontSize === 'xl'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Extra Grande
            </button>
          </div>
        </div>

        {/* Zona 3: Ações Principais: Biblioteca e Imprimir */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Salvar, abrir ou importar outros checklists"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Biblioteca</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            title="Imprimir folha A4 ou salvar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Folha A4</span>
          </button>
        </div>
      </header>

      {/* Dica de Impressão Rápida */}
      {showPrintTips && (
        <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Dica de Impressão:</strong> Na tela de impressão do navegador, marque <em>"Gráficos de segundo plano"</em> e defina a Margem como <em>"Padrão"</em> ou <em>"Mínima"</em> para manter tudo em 1 página exata.
            </span>
          </div>
          <button
            onClick={() => setShowPrintTips(false)}
            className="text-amber-800 hover:text-amber-950 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. ÁREA DE TRABALHO: Dividida entre Editor (Esquerda) e Visualizador A4 (Direita) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* PAINEL LATERAL ESQUERDO: Edição e Configurações */}
        <aside className="no-print w-full lg:w-[420px] bg-white border-r border-slate-200 flex flex-col shrink-0 lg:h-[calc(100vh-53px)]">
          {/* Indicador de Encaixe na Página A4 */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70">
            <PageFitIndicator config={config} onAutoFit={handleAutoFitA4} />
          </div>

          {/* Abas do Painel */}
          <div className="flex border-b border-slate-200 bg-white">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'items'
                  ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Itens do Checklist ({config.items.length})
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'layout'
                  ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Ajustes de Layout & Folha
            </button>
          </div>

          {/* Conteúdo da Aba ITENS */}
          {activeTab === 'items' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Barra de Ação de Itens */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50">
                <button
                  onClick={handleAddItem}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Item
                </button>
                <button
                  onClick={handleClearAllChecks}
                  className="py-2 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Desmarcar todos os quadradinhos para impressão limpa"
                >
                  Limpar Marcações
                </button>
              </div>

              {/* Lista com Rolagem */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {config.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all group"
                  >
                    {/* Miniatura ou Botão de Foto */}
                    <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-4 h-4 text-slate-400" />
                      )}
                      {/* Ações de foto em overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <label
                          className="cursor-pointer p-1 text-white hover:text-amber-300"
                          title="Carregar foto do arquivo"
                        >
                          <Upload className="w-3 h-3" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleQuickUploadPhoto(item.id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        <button
                          onClick={() => handleOpenCameraForItem(item)}
                          className="p-1 text-white hover:text-amber-300"
                          title="Tirar foto com câmera"
                        >
                          <Camera className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Dados do Item - Sem truncar */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-start gap-1.5">
                        <span className="text-xs font-bold text-slate-400 font-mono shrink-0 pt-0.5">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="text-xs font-bold text-slate-900 break-words leading-snug">
                          {item.title}
                        </p>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 break-words mt-0.5 pl-6">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Controles de Reordenação e Edição */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveItem(index, 'down')}
                        disabled={index === config.items.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditorOpen(true);
                        }}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        title="Editar nome e foto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        title="Excluir item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conteúdo da Aba LAYOUT & FOLHA */}
          {activeTab === 'layout' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Logotipo e Identificação da Empresa */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Logotipo & Empresa no Topo
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showCompanyLogo}
                      onChange={(e) => setConfig((p) => ({ ...p, showCompanyLogo: e.target.checked }))}
                      className="rounded text-slate-900"
                    />
                    <span>Ativar Logo</span>
                  </label>
                </div>

                {/* Upload do Logotipo */}
                {config.showCompanyLogo && (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded border border-slate-300 bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {config.companyLogoUrl ? (
                        <img src={config.companyLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Sem Logo</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors">
                        <Upload className="w-3 h-3" />
                        Trocar Logotipo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadCompanyLogo(e.target.files[0]);
                          }}
                        />
                      </label>
                      {config.companyLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setConfig((p) => ({ ...p, companyLogoUrl: '' }))}
                          className="px-2 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Nome da Empresa ao lado do Logotipo */}
                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Nome da Empresa / Estabelecimento:
                    </label>
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showCompanyName}
                        onChange={(e) => setConfig((p) => ({ ...p, showCompanyName: e.target.checked }))}
                        className="rounded text-slate-900"
                      />
                      <span>Exibir</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={config.companyName || ''}
                    onChange={(e) => setConfig((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="Gauchão Restaurante e Cozinha Industrial"
                    className="w-full text-xs font-semibold rounded-lg border border-slate-300 px-3 py-2 text-slate-900 bg-white focus:outline-hidden focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Título e Subtítulo da Folha */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Título do Checklist
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Título do Checklist"
                  className="w-full text-xs font-bold rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Subtítulo ou instruções para preenchimento"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              {/* Número de Colunas (2 ou 3) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Número de Colunas na Folha A4
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Texto 100% completo (sem ...)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSwitchColumns(2)}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      config.columns === 2
                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>2 Colunas</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      Recomendado para até 12 itens
                    </span>
                  </button>

                  <button
                    onClick={() => handleSwitchColumns(3)}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      config.columns === 3
                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>3 Colunas</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      Para listas com 13 a 18 itens
                    </span>
                  </button>
                </div>
              </div>

              {/* Tamanho da Foto */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tamanho das Fotos no Papel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sm', 'md', 'lg'] as PhotoSizeOption[]).map((size) => {
                    const labels = { sm: 'Pequena', md: 'Média', lg: 'Grande' };
                    return (
                      <button
                        key={size}
                        onClick={() => setConfig((p) => ({ ...p, photoSize: size }))}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          config.photoSize === size
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {labels[size]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tamanho da Fonte (Acessibilidade Idosos) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tamanho do Texto (Legibilidade para Idosos)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['sm', 'base', 'lg', 'xl'] as const).map((size) => {
                    const labels: Record<FontSizeOption, string> = {
                      sm: 'Compacta (12px)',
                      base: 'Normal (14px)',
                      lg: 'Grande (16px)',
                      xl: 'Extra (18px)',
                    };
                    return (
                      <button
                        key={size}
                        onClick={() => setConfig((p) => ({ ...p, fontSize: size }))}
                        className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all text-center ${
                          config.fontSize === size
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {labels[size]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Espaçamento entre Itens */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Espaçamento entre os Itens
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['compact', 'balanced', 'spacious'] as ItemSpacingOption[]).map((sp) => {
                    const labels = { compact: 'Compacto', balanced: 'Equilibrado', spacious: 'Amplo' };
                    return (
                      <button
                        key={sp}
                        onClick={() => setConfig((p) => ({ ...p, itemSpacing: sp }))}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          config.itemSpacing === sp
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {labels[sp]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estilo da Caixa de Assinalar */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Estilo da Caixa de Assinalar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setConfig((p) => ({ ...p, checkboxStyle: 'standard' }))}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      config.checkboxStyle === 'standard'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Quadrado 24px
                  </button>
                  <button
                    onClick={() => setConfig((p) => ({ ...p, checkboxStyle: 'large' }))}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      config.checkboxStyle === 'large'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Quadrado 32px
                  </button>
                  <button
                    onClick={() => setConfig((p) => ({ ...p, checkboxStyle: 'conforming' }))}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      config.checkboxStyle === 'conforming'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    [C] / [NC] Duplo
                  </button>
                </div>
              </div>

              {/* Campos do Cabeçalho Impresso */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Linhas de Preenchimento Manual no Topo
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: 'showDate', labelKey: 'dateLabel', defaultLabel: 'Data:' },
                    { key: 'showLocation', labelKey: 'locationLabel', defaultLabel: 'Placa / Veículo:' },
                    { key: 'showInspector', labelKey: 'inspectorLabel', defaultLabel: 'Responsável:' },
                    { key: 'showSignature', labelKey: 'signatureLabel', defaultLabel: 'Assinatura:' },
                  ].map(({ key, labelKey }) => (
                    <div key={key} className="flex items-center justify-between gap-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={(config.headerFields as any)[key]}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              headerFields: {
                                ...prev.headerFields,
                                [key]: e.target.checked,
                              },
                            }))
                          }
                          className="rounded text-slate-900"
                        />
                        <span>{(config.headerFields as any)[labelKey]}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Área de Observações no Rodapé */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Área de Observações no Rodapé
                  </label>
                  <input
                    type="checkbox"
                    checked={config.showNotesArea}
                    onChange={(e) => setConfig((p) => ({ ...p, showNotesArea: e.target.checked }))}
                    className="rounded text-slate-900"
                  />
                </div>
                {config.showNotesArea && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Linhas pautadas:</span>
                    <select
                      value={config.notesLines}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, notesLines: Number(e.target.value) }))
                      }
                      className="text-xs rounded border border-slate-300 py-1 px-2 text-slate-800"
                    >
                      <option value={1}>1 linha</option>
                      <option value={2}>2 linhas</option>
                      <option value={3}>3 linhas</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ÁREA PRINCIPAL DIREITA: Pré-visualização da Folha A4 Real */}
        <main className="flex-1 overflow-y-auto bg-slate-200/80 p-4 sm:p-8 flex flex-col items-center">
          {/* Barra de Ferramentas de Zoom da Folha (Apenas em tela) */}
          <div className="no-print w-full max-w-[794px] mb-3 flex items-center justify-between gap-2 px-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800">Visualização Folha A4:</span>
              <span className="text-slate-500">210mm x 297mm</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-300"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs w-10 text-center font-bold text-slate-700">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-300"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2 py-1 text-[11px] font-bold rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-300"
                title="Zoom 100%"
              >
                100%
              </button>
            </div>
          </div>

          {/* O Documento A4 Real */}
          <div
            className="w-full flex justify-center transition-all duration-200"
            style={{
              transform: zoomLevel === 100 ? 'none' : `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <div className="a4-preview-container bg-white rounded-xs shadow-2xl relative">
              <ChecklistSheet
                config={config}
                interactive={true}
                onEditItem={(item) => {
                  setEditingItem(item);
                  setIsEditorOpen(true);
                }}
                onQuickUploadPhoto={handleQuickUploadPhoto}
                onOpenCameraForItem={handleOpenCameraForItem}
                onDeleteItem={handleDeleteItem}
                onToggleCheck={handleToggleCheck}
                onUploadLogo={handleUploadCompanyLogo}
              />
            </div>
          </div>
        </main>
      </div>

      {/* MODAL DE CAPTURA COM CÂMERA LOCAL */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          setCameraTargetItem(null);
        }}
        onCapture={handleCameraCaptureConfirm}
        itemName={cameraTargetItem?.title}
      />

      {/* MODAL DE EDIÇÃO DE ITEM */}
      <ItemEditorModal
        isOpen={isEditorOpen}
        item={editingItem}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingItem(null);
        }}
        onSave={handleUpdateItem}
        onDelete={handleDeleteItem}
        onOpenLiveCamera={(item) => {
          setIsEditorOpen(false);
          setCameraTargetItem(item);
          setIsCameraOpen(true);
        }}
      />

      {/* MODAL DA BIBLIOTECA DE CHECKLISTS */}
      <ChecklistLibraryModal
        isOpen={isLibraryOpen}
        currentConfig={config}
        onClose={() => setIsLibraryOpen(false)}
        onSelectChecklist={(selected) => setConfig(selected)}
        onNewEmptyChecklist={handleNewEmpty}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ChecklistItem } from '../types/checklist';
import { X, Upload, Camera, Trash2, Check, Image as ImageIcon } from 'lucide-react';
import { createSvgThumbnail } from '../utils/presets';

interface ItemEditorModalProps {
  isOpen: boolean;
  item: ChecklistItem | null;
  onClose: () => void;
  onSave: (updatedItem: ChecklistItem) => void;
  onDelete?: (itemId: string) => void;
  onOpenLiveCamera: (item: ChecklistItem) => void;
}

const PRESET_ICONS = [
  { label: 'Extintor', type: 'triangle', bg: '#fee2e2', stroke: '#b91c1c' },
  { label: 'Ferramentas', type: 'wrench', bg: '#f1f5f9', stroke: '#1e293b' },
  { label: 'Chaves', type: 'key', bg: '#ede9fe', stroke: '#6d28d9' },
  { label: 'Óleo / Fluidos', type: 'oil', bg: '#fef3c7', stroke: '#b45309' },
  { label: 'Pneu / Rodas', type: 'wheel', bg: '#f1f5f9', stroke: '#1e293b' },
  { label: 'Bateria', type: 'battery', bg: '#e0f2fe', stroke: '#0369a1' },
  { label: 'Manômetro', type: 'gauge', bg: '#fef9c3', stroke: '#a16207' },
  { label: 'Socorro / Saúde', type: 'medical', bg: '#ecfdf5', stroke: '#047857' },
  { label: 'Veículo / Geral', type: 'car', bg: '#f3f4f6', stroke: '#374151' },
];

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  onDelete,
  onOpenLiveCamera,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setSubtitle(item.subtitle || '');
      setImageUrl(item.imageUrl || '');
    } else {
      setTitle('');
      setSubtitle('');
      setImageUrl('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...item,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      imageUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">
            Editar Item do Checklist
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          {/* Nome do Item */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nome do Item (Obrigatório)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Extintor de Incêndio, Lanterna, Macaco..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Descrição / Instrução Secundária */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Descrição / Observação Secundária (Opcional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: Verificar lacre e ponteiro na faixa verde"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Foto do Item */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Foto / Imagem do Item
            </label>

            <div className="flex items-start gap-4">
              {/* Thumbnail Preview */}
              <div className="w-24 h-24 rounded-lg border-2 border-slate-300 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-center p-1">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Sem Imagem</span>
                  </div>
                )}
              </div>

              {/* Botões para carregar foto */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Carregar do Arquivo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => onOpenLiveCamera(item)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Capturar com Câmera
                  </button>

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-2.5 py-2 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Remover Foto
                    </button>
                  )}
                </div>

                {/* Ícones Rápidos caso não tenha foto pronta */}
                <div>
                  <p className="text-[11px] text-slate-500 mb-1 font-medium">
                    Ou selecione um ícone rápido ilustrativo:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ICONS.map((icon, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setImageUrl(
                            createSvgThumbnail(icon.label, icon.type, icon.bg, icon.stroke)
                          )
                        }
                        className="text-[11px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {icon.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir Item
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

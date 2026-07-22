'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable, type Column } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useKunstwerkFotoUpload } from '@/lib/useKunstwerkFotoUpload';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { logActiviteit, actorFromMedewerker } from '@/lib/logActiviteit';
import type { Kunstwerk, Segment, Materiaal, Maat, PrijsRegel } from './materiaalTypes';

interface KunstwerkenSectionProps {
  kunstwerken: Kunstwerk[] | null;
  segmenten: Segment[] | null;
  materialen: Materiaal[] | null;
  maten: Maat[] | null;
  loadError: string | null;
  onAdd: (data: Omit<Kunstwerk, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, data: Omit<Kunstwerk, 'id'>) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
}

type ModalState = { mode: 'add' } | { mode: 'edit'; kunstwerk: Kunstwerk } | null;
type PrijzenState = Record<string, string>;
type KunstwerkRow = Kunstwerk & { segmentNamen: string };

function prijsKey(materiaalId: string, maatId: string) {
  return `${materiaalId}:${maatId}`;
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

const LEGE_FORM = {
  foto: '',
  segmentIds: [] as string[],
  materiaalIds: [] as string[],
  maatIds: [] as string[],
  prijzen: {} as PrijzenState,
  omschrijvingNl: '',
  omschrijvingFr: '',
  omschrijvingDe: '',
  omschrijvingEn: '',
};

export function KunstwerkenSection({
  kunstwerken,
  segmenten,
  materialen,
  maten,
  loadError,
  onAdd,
  onUpdate,
  onRemove,
}: KunstwerkenSectionProps) {
  const t = useTranslations('beheer');
  const { uploading, error: fotoUploadError, upload } = useKunstwerkFotoUpload();
  const { user } = useAdminAuth();
  const [modalState, setModalState] = useState<ModalState>(null);
  const [foto, setFoto] = useState(LEGE_FORM.foto);
  const [segmentIds, setSegmentIds] = useState<string[]>(LEGE_FORM.segmentIds);
  const [materiaalIds, setMateriaalIds] = useState<string[]>(LEGE_FORM.materiaalIds);
  const [maatIds, setMaatIds] = useState<string[]>(LEGE_FORM.maatIds);
  const [prijzen, setPrijzen] = useState<PrijzenState>(LEGE_FORM.prijzen);
  const [omschrijvingNl, setOmschrijvingNl] = useState(LEGE_FORM.omschrijvingNl);
  const [omschrijvingFr, setOmschrijvingFr] = useState(LEGE_FORM.omschrijvingFr);
  const [omschrijvingDe, setOmschrijvingDe] = useState(LEGE_FORM.omschrijvingDe);
  const [omschrijvingEn, setOmschrijvingEn] = useState(LEGE_FORM.omschrijvingEn);
  const [actionError, setActionError] = useState<string | null>(null);

  const segmentNaamById = useMemo(() => {
    const map = new Map<string, string>();
    (segmenten ?? []).forEach((segment) => map.set(segment.id, segment.omschrijving));
    return map;
  }, [segmenten]);

  if (loadError) {
    return (
      <p data-testid="kunstwerken-error" className="text-xs text-red-400">
        {loadError}
      </p>
    );
  }

  if (kunstwerken === null) {
    return null;
  }

  const rows: KunstwerkRow[] = kunstwerken.map((kunstwerk) => ({
    ...kunstwerk,
    segmentNamen: kunstwerk.segmentIds.map((id) => segmentNaamById.get(id) ?? id).join(', '),
  }));

  function resetForm() {
    setFoto(LEGE_FORM.foto);
    setSegmentIds(LEGE_FORM.segmentIds);
    setMateriaalIds(LEGE_FORM.materiaalIds);
    setMaatIds(LEGE_FORM.maatIds);
    setPrijzen(LEGE_FORM.prijzen);
    setOmschrijvingNl(LEGE_FORM.omschrijvingNl);
    setOmschrijvingFr(LEGE_FORM.omschrijvingFr);
    setOmschrijvingDe(LEGE_FORM.omschrijvingDe);
    setOmschrijvingEn(LEGE_FORM.omschrijvingEn);
    setActionError(null);
  }

  function openAdd() {
    resetForm();
    setModalState({ mode: 'add' });
  }

  function openEdit(kunstwerk: Kunstwerk) {
    setFoto(kunstwerk.foto);
    setSegmentIds(kunstwerk.segmentIds);
    setMateriaalIds(kunstwerk.materiaalIds);
    setMaatIds(kunstwerk.maatIds);
    const prijzenMap: PrijzenState = {};
    kunstwerk.prijzen.forEach((regel) => {
      prijzenMap[prijsKey(regel.materiaalId, regel.maatId)] = String(regel.prijs);
    });
    setPrijzen(prijzenMap);
    setOmschrijvingNl(kunstwerk.omschrijvingNl);
    setOmschrijvingFr(kunstwerk.omschrijvingFr);
    setOmschrijvingDe(kunstwerk.omschrijvingDe);
    setOmschrijvingEn(kunstwerk.omschrijvingEn);
    setActionError(null);
    setModalState({ mode: 'edit', kunstwerk });
  }

  function closeModal() {
    setModalState(null);
  }

  async function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) {
      setFoto(url);
    }
  }

  const prijsCombinaties = materiaalIds.flatMap((materiaalId) =>
    maatIds.map((maatId) => ({ materiaalId, maatId }))
  );
  const allePrijzenIngevuld = prijsCombinaties.every(
    ({ materiaalId, maatId }) => (prijzen[prijsKey(materiaalId, maatId)] ?? '') !== ''
  );
  const opslaanDisabled =
    !foto ||
    uploading ||
    segmentIds.length === 0 ||
    materiaalIds.length === 0 ||
    maatIds.length === 0 ||
    !allePrijzenIngevuld ||
    !omschrijvingNl;

  async function handleSave() {
    if (!modalState) return;
    const prijzenArray: PrijsRegel[] = prijsCombinaties.map(({ materiaalId, maatId }) => ({
      materiaalId,
      maatId,
      prijs: Number(prijzen[prijsKey(materiaalId, maatId)]),
    }));
    const data = {
      foto,
      segmentIds,
      materiaalIds,
      maatIds,
      prijzen: prijzenArray,
      omschrijvingNl,
      omschrijvingFr,
      omschrijvingDe,
      omschrijvingEn,
    };
    const success = modalState.mode === 'add' ? await onAdd(data) : await onUpdate(modalState.kunstwerk.id, data);
    if (success) {
      void logActiviteit(
        modalState.mode === 'add' ? 'kunstwerk_toegevoegd' : 'kunstwerk_gewijzigd',
        actorFromMedewerker(user)
      );
      closeModal();
    } else {
      setActionError(t('kunstwerkenActionError'));
    }
  }

  async function handleRemove() {
    if (modalState?.mode !== 'edit') return;
    const success = await onRemove(modalState.kunstwerk.id);
    if (success) {
      void logActiviteit('kunstwerk_verwijderd', actorFromMedewerker(user));
      closeModal();
    } else {
      setActionError(t('kunstwerkenActionError'));
    }
  }

  const columns: Column<KunstwerkRow>[] = [
    {
      key: 'foto',
      label: t('kunstwerkenColFoto'),
      sortable: false,
      render: (row) => <img src={row.foto} alt="" className="h-10 w-10 rounded object-cover" />,
    },
    { key: 'segmentNamen', label: t('kunstwerkenColSegmenten') },
    { key: 'omschrijvingNl', label: t('kunstwerkenColOmschrijving') },
  ];

  return (
    <div data-testid="kunstwerken-section">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={openAdd}
          data-testid="kunstwerken-add"
          className="rounded-sm bg-silver px-4 py-2 text-xs tracking-wide text-ink"
        >
          {t('kunstwerkenToevoegen')}
        </button>
      </div>
      <DataTable<KunstwerkRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        onRowClick={openEdit}
        emptyLabel={t('kunstwerkenEmpty')}
        searchPlaceholder={t('dataTableSearchPlaceholder')}
      />
      <Modal isOpen={modalState !== null} onClose={closeModal} closeLabel={t('modalClose')}>
        <div data-testid="kunstwerk-modal" className="flex flex-col gap-3 text-sm text-white/80">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-white/60">
            {t('kunstwerkenLabelFoto')}
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              data-testid="kunstwerk-modal-foto-input"
              className="text-sm text-white"
            />
          </label>
          {uploading && (
            <p data-testid="kunstwerk-modal-foto-uploading" className="text-xs text-white/60">
              {t('kunstwerkenFotoUploading')}
            </p>
          )}
          {fotoUploadError && (
            <p data-testid="kunstwerk-modal-foto-error" className="text-xs text-red-400">
              {t('kunstwerkenFotoUploadError')}
            </p>
          )}
          {foto && (
            <img
              src={foto}
              alt=""
              data-testid="kunstwerk-modal-foto-preview"
              className="h-24 w-24 rounded object-cover"
            />
          )}

          <fieldset className="flex flex-col gap-1">
            <legend className="text-xs uppercase tracking-wide text-white/60">
              {t('kunstwerkenLabelSegmenten')}
            </legend>
            {(segmenten ?? []).map((segment) => (
              <label key={segment.id} className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={segmentIds.includes(segment.id)}
                  onChange={() => setSegmentIds((current) => toggle(current, segment.id))}
                  data-testid={`kunstwerk-modal-segment-${segment.id}`}
                />
                {segment.omschrijving}
              </label>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-1">
            <legend className="text-xs uppercase tracking-wide text-white/60">
              {t('kunstwerkenLabelMaterialen')}
            </legend>
            {(materialen ?? []).map((materiaal) => (
              <label key={materiaal.id} className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={materiaalIds.includes(materiaal.id)}
                  onChange={() => setMateriaalIds((current) => toggle(current, materiaal.id))}
                  data-testid={`kunstwerk-modal-materiaal-${materiaal.id}`}
                />
                {`${materiaal.materiaaldikte}mm — ${materiaal.omschrijving}`}
              </label>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-1">
            <legend className="text-xs uppercase tracking-wide text-white/60">{t('kunstwerkenLabelMaten')}</legend>
            {(maten ?? []).map((maat) => (
              <label key={maat.id} className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={maatIds.includes(maat.id)}
                  onChange={() => setMaatIds((current) => toggle(current, maat.id))}
                  data-testid={`kunstwerk-modal-maat-${maat.id}`}
                />
                {`${maat.breedte}×${maat.hoogte} cm`}
              </label>
            ))}
          </fieldset>

          {materiaalIds.length > 0 && maatIds.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-white/60">{t('kunstwerkenLabelPrijzen')}</span>
              <table data-testid="kunstwerk-modal-prijzen" className="text-sm text-white/80">
                <thead>
                  <tr>
                    <th></th>
                    {maatIds.map((maatId) => {
                      const maat = (maten ?? []).find((m) => m.id === maatId);
                      return (
                        <th key={maatId} className="px-2 py-1 text-xs">
                          {maat ? `${maat.breedte}×${maat.hoogte}` : maatId}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {materiaalIds.map((materiaalId) => {
                    const materiaal = (materialen ?? []).find((m) => m.id === materiaalId);
                    return (
                      <tr key={materiaalId}>
                        <td className="px-2 py-1 text-xs">
                          {materiaal ? `${materiaal.materiaaldikte}mm` : materiaalId}
                        </td>
                        {maatIds.map((maatId) => {
                          const key = prijsKey(materiaalId, maatId);
                          return (
                            <td key={maatId} className="px-2 py-1">
                              <input
                                type="number"
                                value={prijzen[key] ?? ''}
                                onChange={(event) =>
                                  setPrijzen((current) => ({ ...current, [key]: event.target.value }))
                                }
                                data-testid={`kunstwerk-modal-prijs-${materiaalId}-${maatId}`}
                                className="w-20 rounded-sm bg-black/40 px-2 py-1 text-sm text-white"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-white/60">
            {t('kunstwerkenLabelOmschrijvingNl')}
            <textarea
              value={omschrijvingNl}
              onChange={(event) => setOmschrijvingNl(event.target.value)}
              data-testid="kunstwerk-modal-omschrijving-nl"
              className="rounded-sm bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-white/60">
            {t('kunstwerkenLabelOmschrijvingFr')}
            <textarea
              value={omschrijvingFr}
              onChange={(event) => setOmschrijvingFr(event.target.value)}
              data-testid="kunstwerk-modal-omschrijving-fr"
              className="rounded-sm bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-white/60">
            {t('kunstwerkenLabelOmschrijvingDe')}
            <textarea
              value={omschrijvingDe}
              onChange={(event) => setOmschrijvingDe(event.target.value)}
              data-testid="kunstwerk-modal-omschrijving-de"
              className="rounded-sm bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-white/60">
            {t('kunstwerkenLabelOmschrijvingEn')}
            <textarea
              value={omschrijvingEn}
              onChange={(event) => setOmschrijvingEn(event.target.value)}
              data-testid="kunstwerk-modal-omschrijving-en"
              className="rounded-sm bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>

          {actionError && (
            <p data-testid="kunstwerk-modal-error" className="text-xs text-red-400">
              {actionError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={opslaanDisabled}
              data-testid="kunstwerk-modal-opslaan"
              className="rounded-sm bg-silver px-4 py-2 text-xs tracking-wide text-ink disabled:opacity-40"
            >
              {t('kunstwerkenOpslaan')}
            </button>
            {modalState?.mode === 'edit' && (
              <button
                type="button"
                onClick={handleRemove}
                data-testid="kunstwerk-modal-verwijderen"
                className="rounded-sm border border-white/20 px-4 py-2 text-xs tracking-wide text-white/70 hover:border-white/40 hover:text-white"
              >
                {t('kunstwerkenVerwijderen')}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

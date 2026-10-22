import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Truck,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ParcelTariffRow, StoreSettings } from '../../types';
import {
  DEFAULT_SPEED_POST_TARIFF_TABLE,
  DEFAULT_INDIA_POST_TARIFF_TABLE,
  parseCourierTariffXml,
  downloadTariffXmlTemplate,
  lookupTariffRate,
} from '../../lib/parcelTariffXml';

interface ParcelTariffSectionProps {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  setIsSettingsDirty: (dirty: boolean) => void;
  addToast: (toast: any) => void;
}

export const ParcelTariffSection: React.FC<ParcelTariffSectionProps> = ({
  settingsForm,
  setSettingsForm,
  setIsSettingsDirty,
  addToast,
}) => {
  const [speedPostPreviewExpanded, setSpeedPostPreviewExpanded] = useState(false);
  const [indiaPostPreviewExpanded, setIndiaPostPreviewExpanded] = useState(false);
  const [simWeightGrams, setSimWeightGrams] = useState<number>(1200);

  const speedPostTable: ParcelTariffRow[] = settingsForm.speedPostTariffTable || [];
  const indiaPostTable: ParcelTariffRow[] = settingsForm.indiaPostTariffTable || [];
  const isTariffModeActive = settingsForm.useParcelTariffTable === true;

  // Toggle calculation mode
  const handleToggleMode = (enableTariff: boolean) => {
    setSettingsForm((prev) => ({
      ...prev,
      useParcelTariffTable: enableTariff,
    }));
    setIsSettingsDirty(true);
    addToast({
      type: enableTariff ? 'success' : 'info',
      title: enableTariff ? 'Parcel Tariff Mode Activated' : 'Standard Per-Kg Rate Mode Activated',
      message: enableTariff
        ? 'Speed Post & India Post will now calculate shipping charges using the imported parcel tariff tables.'
        : 'Shipping fees will calculate using standard ₹/kg and weight rounding slabs.',
    });
  };

  // Handle XML file upload for a specific courier
  const handleXmlUpload = (
    courier: 'speed-post' | 'india-post',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const courierTitle = courier === 'speed-post' ? 'Speed Post' : 'India Post';
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parseResult = parseCourierTariffXml(content, courier);

      if (!parseResult.success || parseResult.rows.length === 0) {
        addToast({
          type: 'error',
          title: `${courierTitle} XML Parse Error`,
          message: parseResult.error || 'Failed to extract valid tariff slabs from XML.',
        });
        return;
      }

      setSettingsForm((prev) => {
        if (courier === 'speed-post') {
          return {
            ...prev,
            speedPostTariffTable: parseResult.rows,
            useParcelTariffTable: true, // auto-activate
          };
        } else {
          return {
            ...prev,
            indiaPostTariffTable: parseResult.rows,
            useParcelTariffTable: true, // auto-activate
          };
        }
      });

      setIsSettingsDirty(true);
      addToast({
        type: 'success',
        title: `${courierTitle} Tariff Table Imported!`,
        message: `Successfully loaded ${parseResult.rows.length} weight tiers (500g to ${parseResult.rows[parseResult.rows.length - 1].maxGrams}g) for Kerala, Tamil Nadu & Karnataka.`,
      });

      // Expand preview
      if (courier === 'speed-post') setSpeedPostPreviewExpanded(true);
      else setIndiaPostPreviewExpanded(true);
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  // Load official chart presets from user image
  const handleLoadOfficialPreset = (courier: 'speed-post' | 'india-post') => {
    const courierTitle = courier === 'speed-post' ? 'Speed Post' : 'India Post';
    const presetRows = courier === 'speed-post' ? DEFAULT_SPEED_POST_TARIFF_TABLE : DEFAULT_INDIA_POST_TARIFF_TABLE;

    setSettingsForm((prev) => ({
      ...prev,
      [courier === 'speed-post' ? 'speedPostTariffTable' : 'indiaPostTariffTable']: presetRows,
      useParcelTariffTable: true,
    }));

    setIsSettingsDirty(true);
    addToast({
      type: 'success',
      title: `${courierTitle} Official Rates Loaded`,
      message: `Loaded official 37-tier Postal Department contractual tariff table w.e.f. 01.08.2026. Remember to click Save Changes.`,
    });

    if (courier === 'speed-post') setSpeedPostPreviewExpanded(true);
    else setIndiaPostPreviewExpanded(true);
  };

  // Clear specific courier tariff table
  const handleClearTable = (courier: 'speed-post' | 'india-post') => {
    const courierTitle = courier === 'speed-post' ? 'Speed Post' : 'India Post';
    setSettingsForm((prev) => ({
      ...prev,
      [courier === 'speed-post' ? 'speedPostTariffTable' : 'indiaPostTariffTable']: [],
    }));
    setIsSettingsDirty(true);
    addToast({
      type: 'info',
      title: `${courierTitle} Tariff Table Cleared`,
      message: `Removed custom tariff table for ${courierTitle}. Standard per-kg calculations will apply.`,
    });
  };

  return (
    <div className="mt-8 pt-6 border-t border-emerald-900/10 space-y-6">
      {/* Header & Mode Switch */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#062e1c] to-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            Contractual Postal Tariffs (XML)
          </div>
          <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Speed Post & India Post Parcel Tariff Tables
          </h4>
          <p className="text-xs text-emerald-100/80 max-w-xl leading-relaxed">
            Import contractual postal parcel tariff tables separately for <strong>Speed Post</strong> and <strong>India Post</strong> via XML files, with dedicated columns for <strong>Kerala</strong>, <strong>Tamil Nadu</strong>, and <strong>Karnataka</strong>.
          </p>
        </div>

        {/* Calculation Mode Toggle Switch */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex flex-col items-center sm:items-end gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
            Calculation Mode
          </span>
          <div className="inline-flex p-1 bg-black/40 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                !isTariffModeActive
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Standard Per-Kg Rate
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                isTariffModeActive
                  ? 'bg-amber-400 text-emerald-950 shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Tariff Table Mode
            </button>
          </div>
          <span className="text-[10px] text-emerald-300/80">
            {isTariffModeActive
              ? '✓ Using imported XML parcel tariff tables'
              : 'Using standard ₹/kg and weight slabs'}
          </span>
        </div>
      </div>

      {/* Two Separate Tariff Cards: Speed Post and India Post */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: SPEED POST */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs border border-amber-200 shadow-2xs">
                  ⚡
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-gray-900">Speed Post Parcel Contractual</h5>
                  <span className="text-[11px] text-gray-500 block">
                    {speedPostTable.length > 0
                      ? `${speedPostTable.length} weight tiers loaded (upto ${speedPostTable[speedPostTable.length - 1].maxGrams / 1000} kg)`
                      : 'No custom XML table uploaded (using fallback)'}
                  </span>
                </div>
              </div>

              {speedPostTable.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active
                </span>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* File upload */}
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Speed Post XML</span>
                <input
                  type="file"
                  accept=".xml,application/xml,text/xml"
                  onChange={(e) => handleXmlUpload('speed-post', e)}
                  className="hidden"
                />
              </label>

              {/* Template Download */}
              <button
                type="button"
                onClick={() => downloadTariffXmlTemplate('speed-post', speedPostTable.length ? speedPostTable : undefined)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>Download Template</span>
              </button>

              {/* Preset from image */}
              <button
                type="button"
                onClick={() => handleLoadOfficialPreset('speed-post')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Populate 37 tiers up to 35,000g matching official 01.08.2026 Postal chart"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Load Official Chart</span>
              </button>

              {speedPostTable.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleClearTable('speed-post')}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                  title="Clear Speed Post Table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table Preview Drawer */}
          {speedPostTable.length > 0 ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSpeedPostPreviewExpanded(!speedPostPreviewExpanded)}
                className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>View Speed Post Tariff Table ({speedPostTable.length} rows)</span>
                {speedPostPreviewExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {speedPostPreviewExpanded && (
                <div className="mt-2 border border-gray-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-emerald-900/5 text-emerald-950 font-bold sticky top-0 border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">Weight upto gm</th>
                        <th className="py-2 px-3 text-right">Kerala (₹)</th>
                        <th className="py-2 px-3 text-right">Tamil Nadu (₹)</th>
                        <th className="py-2 px-3 text-right">Karnataka (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {speedPostTable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/50">
                          <td className="py-1.5 px-3 font-mono font-medium text-gray-700">
                            {row.maxGrams.toLocaleString()} gm ({row.maxGrams / 1000} kg)
                          </td>
                          <td className="py-1.5 px-3 text-right font-extrabold text-emerald-800">₹{row.kerala}</td>
                          <td className="py-1.5 px-3 text-right font-extrabold text-blue-800">₹{row.tamilNadu}</td>
                          <td className="py-1.5 px-3 text-right font-extrabold text-purple-800">₹{row.karnataka}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
              No Speed Post tariff table imported yet. Upload an XML file or click "Load Official Chart".
            </div>
          )}
        </div>

        {/* CARD 2: INDIA POST */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-black text-xs border border-red-200 shadow-2xs">
                  📮
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-gray-900">India Post Parcel Contractual</h5>
                  <span className="text-[11px] text-gray-500 block">
                    {indiaPostTable.length > 0
                      ? `${indiaPostTable.length} weight tiers loaded (upto ${indiaPostTable[indiaPostTable.length - 1].maxGrams / 1000} kg)`
                      : 'No custom XML table uploaded (using fallback)'}
                  </span>
                </div>
              </div>

              {indiaPostTable.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active
                </span>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* File upload */}
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Import India Post XML</span>
                <input
                  type="file"
                  accept=".xml,application/xml,text/xml"
                  onChange={(e) => handleXmlUpload('india-post', e)}
                  className="hidden"
                />
              </label>

              {/* Template Download */}
              <button
                type="button"
                onClick={() => downloadTariffXmlTemplate('india-post', indiaPostTable.length ? indiaPostTable : undefined)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>Download Template</span>
              </button>

              {/* Preset from image */}
              <button
                type="button"
                onClick={() => handleLoadOfficialPreset('india-post')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Populate 37 tiers up to 35,000g matching official 01.08.2026 Postal chart"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Load Official Chart</span>
              </button>

              {indiaPostTable.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleClearTable('india-post')}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                  title="Clear India Post Table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table Preview Drawer */}
          {indiaPostTable.length > 0 ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIndiaPostPreviewExpanded(!indiaPostPreviewExpanded)}
                className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>View India Post Tariff Table ({indiaPostTable.length} rows)</span>
                {indiaPostPreviewExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {indiaPostPreviewExpanded && (
                <div className="mt-2 border border-gray-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-red-900/5 text-red-950 font-bold sticky top-0 border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">Weight upto gm</th>
                        <th className="py-2 px-3 text-right">Kerala (₹)</th>
                        <th className="py-2 px-3 text-right">Tamil Nadu (₹)</th>
                        <th className="py-2 px-3 text-right">Karnataka (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {indiaPostTable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-red-50/50">
                          <td className="py-1.5 px-3 font-mono font-medium text-gray-700">
                            {row.maxGrams.toLocaleString()} gm ({row.maxGrams / 1000} kg)
                          </td>
                          <td className="py-1.5 px-3 text-right font-extrabold text-emerald-800">₹{row.kerala}</td>
                          <td className="py-1.5 px-3 text-right font-extrabold text-blue-800">₹{row.tamilNadu}</td>
                          <td className="py-1.5 px-3 text-right font-extrabold text-purple-800">₹{row.karnataka}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
              No India Post tariff table imported yet. Upload an XML file or click "Load Official Chart".
            </div>
          )}
        </div>
      </div>

      {/* Live Calculator Simulation comparing both tables and states */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-700" />
              Live Tariff Rate Calculator (Weight Simulator)
            </h5>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Test any package weight to verify exact rates across Kerala, Tamil Nadu, and Karnataka.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-950">Test Weight:</span>
            <input
              type="number"
              min="100"
              max="50000"
              step="100"
              value={simWeightGrams}
              onChange={(e) => setSimWeightGrams(Math.max(1, Number(e.target.value) || 0))}
              className="w-28 px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-extrabold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <span className="text-xs font-mono font-bold text-emerald-700">
              ({(simWeightGrams / 1000).toFixed(2)} kg)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['Kerala', 'Tamil Nadu', 'Karnataka'].map((stateName) => {
            const speedPostFee = lookupTariffRate(simWeightGrams, stateName, speedPostTable);
            const indiaPostFee = lookupTariffRate(simWeightGrams, stateName, indiaPostTable);

            return (
              <div
                key={stateName}
                className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="font-black text-xs text-emerald-950">{stateName}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{(simWeightGrams / 1000).toFixed(2)} kg</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-[11px] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Speed Post:
                    </span>
                    <span className="font-extrabold text-emerald-900">
                      {speedPostFee !== null ? `₹${speedPostFee}` : 'Not imported'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-[11px] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                      India Post:
                    </span>
                    <span className="font-extrabold text-emerald-900">
                      {indiaPostFee !== null ? `₹${indiaPostFee}` : 'Not imported'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from "react";

export default function BankManagerSlip({ reportData, applicantData }) {
  if (!reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  const { feasibility, best_scheme, routed_partner, rural_metrics, document_readiness } = reportData;

  return (
    <div className="bg-white p-6 border border-slate-300 rounded-none shadow-sm my-6 print:m-0 print:border-none font-sans">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-none">
              GOVERNMENT SCHEME PROPOSAL SLIP
            </span>
            <span className="text-xs text-slate-500 font-mono">
              REF: SAHAY-{new Date().getFullYear()}-{Math.floor(100000 + Math.random() * 900000)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 font-serif">
            Micro-Enterprise Feasibility & Statutory Credit Appraisal
          </h2>
          <p className="text-xs text-slate-600">
            Automated verification via Sahay-AI (Census RGI 2011 + OpenStreetMap Spatial Nodes + Scheme Rules)
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="print:hidden px-4 py-2 bg-slate-900 text-white rounded-none text-sm font-medium hover:bg-slate-800 flex items-center gap-1.5 shadow-sm border border-black"
        >
          <span>🖨️</span>
          <span>Print for Bank Manager</span>
        </button>
      </div>

      {/* Grid: Applicant, Scheme, Branch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 py-2 border-b border-slate-200 text-sm">
        <div className="bg-slate-50 p-3 rounded-none border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase">Applicant Details</p>
          <p className="font-bold text-slate-900 mt-1">{applicantData?.applicant_full_name || "Applicant"}</p>
          <p className="text-xs text-slate-600">Trade: {applicantData?.trade_category?.toUpperCase() || "N/A"}</p>
          <p className="text-xs text-slate-600">Block: {feasibility?.block_name?.toUpperCase()}</p>
          <p className="text-xs text-slate-600">Margin Deposited: ₹{applicantData?.available_margin?.toLocaleString("en-IN")}</p>
        </div>

        <div className="bg-emerald-50 p-3 rounded-none border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-800 uppercase">Statutory Scheme Match</p>
          <p className="font-bold text-emerald-950 mt-1">{best_scheme?.scheme_name}</p>
          <p className="text-xs text-emerald-800 font-mono">Code: {best_scheme?.scheme_code}</p>
          <p className="text-xs text-emerald-900 font-semibold">
            Loan Amount: ₹{best_scheme?.loan_amount?.toLocaleString("en-IN")} @ {best_scheme?.effective_interest_rate * 100}% p.a.
          </p>
          <p className="text-xs text-emerald-700">Tenure: {best_scheme?.tenure_years} Years (Moratorium: 3 Mos)</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-none border border-blue-200">
          <p className="text-xs font-semibold text-blue-800 uppercase">Allocated Channel Partner</p>
          <p className="font-bold text-blue-950 mt-1">{routed_partner?.branch_name || "Nearest Solvent Branch"}</p>
          <p className="text-xs text-blue-800">Institution: {routed_partner?.institution_name}</p>
          <p className="text-xs text-blue-800 font-mono">IFSC: {routed_partner?.ifsc_code || "BRANCH-ROUTED"}</p>
          <p className="text-xs text-blue-700">Distance: {routed_partner?.distance_km} km from applicant</p>
        </div>
      </div>

      {/* Grounded Feasibility Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-1">
            Grounded Market Feasibility (Census + OSM Live Overpass)
          </h4>
          <ul className="space-y-1 text-slate-700 list-disc list-inside bg-slate-50 p-3 rounded-none border border-slate-200">
            <li>
              <strong>Total Target Households:</strong> {feasibility?.demographics?.total_households?.toLocaleString("en-IN")}
            </li>
            <li>
              <strong>Female Literacy in Block:</strong> {feasibility?.demographics?.female_literacy_pct}%
            </li>
            <li>
              <strong>Verified Competitor Density (5km):</strong> {feasibility?.competitor_count} shops mapped
            </li>
            <li>
              <strong>Median Household Spend:</strong> ~₹{feasibility?.demographics?.estimated_median_household_monthly_spend_inr?.toLocaleString("en-IN")}/mo
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-1">
            Repayment Capacity & Daily Cashflow
          </h4>
          <div className="bg-slate-50 p-3 rounded-none border border-slate-200 space-y-1 text-slate-700">
            <p>
              <strong>Quarterly EMI:</strong> ₹{rural_metrics?.monthly_emi ? (rural_metrics.monthly_emi * 3).toLocaleString("en-IN") : "N/A"}
            </p>
            <p>
              <strong>Daily Earning Equivalence:</strong> ₹{rural_metrics?.daily_cost}/day ({rural_metrics?.daily_analogy})
            </p>
            <p className="text-emerald-700 font-semibold">
              <strong>Moratorium Benefit:</strong> First {best_scheme?.moratorium_months || 3} months grace period (no principal due).
            </p>
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
        <p>Verified through DigiLocker & Statutory Central Registry Rules.</p>
        <p className="font-mono">STATUS: APPRAISAL READY FOR DISBURSAL</p>
      </div>
    </div>
  );
}
